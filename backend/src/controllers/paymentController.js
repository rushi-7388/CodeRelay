import Stripe from "stripe";
import { Plan, Subscription, Invoice } from "../models/Subscription.js";
import Organization from "../models/Organization.js";
import { ENV } from "../lib/env.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY || "sk_test_placeholder");

export async function getPlans(req, res) {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createCheckoutSession(req, res) {
  try {
    const userId = req.user._id;
    const { planId, organizationId, interval = "month" } = req.body;

    if (!planId || planId.length < 24) {
      return res.status(400).json({
        message: "Invalid Plan configuration. You are using frontend fallback plans. Please create real Subscription Plans in your database to test Stripe checkouts."
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found in Database." });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin"].includes(m.role)
    );

    if (!userMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let customerId = organization.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: organization.name,
        metadata: {
          organizationId: organization._id.toString(),
          userId: userId.toString(),
        },
      });
      customerId = customer.id;

      organization.subscription = {
        stripeCustomerId: customerId,
      };
      await organization.save();
    }

    const priceId = interval === "year" && plan.stripeYearlyPriceId
      ? plan.stripeYearlyPriceId
      : plan.stripePriceId;

    if (!priceId) {
      return res.status(400).json({ message: "Stripe price not configured for this plan in your Database." });
    }

    if (ENV.STRIPE_SECRET_KEY === "sk_test_placeholder" || !ENV.STRIPE_SECRET_KEY) {
      return res.status(400).json({ message: "Invalid or missing Stripe Secret Key in Backend Environment Variables." });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
      },
      success_url: `${ENV.CLIENT_URL}/organizations/${organization._id}?success=true`,
      cancel_url: `${ENV.CLIENT_URL}/organizations/${organization._id}?canceled=true`,
    });

    res.status(200).json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createPortalSession(req, res) {
  try {
    const userId = req.user._id;
    const { organizationId } = req.body;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin"].includes(m.role)
    );

    if (!userMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!organization.subscription?.stripeCustomerId) {
      return res.status(400).json({ message: "No active subscription" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.subscription.stripeCustomerId,
      return_url: `${ENV.CLIENT_URL}/organization/${organization._id}/billing`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      case "customer.updated": {
        const customer = event.data.object;
        await handleCustomerUpdate(customer);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error.message);
    res.status(500).json({ message: "Webhook handler error" });
  }
}

async function handleCheckoutComplete(session) {
  const { organizationId, planId } = session.metadata;

  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await Subscription.findOneAndUpdate(
    { organization: organizationId },
    {
      organization: organizationId,
      plan: planId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: session.customer,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
    { upsert: true }
  );

  await Organization.findByIdAndUpdate(organizationId, {
    "subscription.stripeSubscriptionId": subscription.id,
    "subscription.isActive": true,
  });
}

async function handleSubscriptionUpdate(subscription) {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  );

  const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (sub) {
    await Organization.findByIdAndUpdate(sub.organization, {
      "subscription.isActive": subscription.status === "active",
    });
  }
}

async function handleSubscriptionCanceled(subscription) {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: "canceled",
      canceledAt: new Date(),
    }
  );

  const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (sub) {
    await Organization.findByIdAndUpdate(sub.organization, {
      "subscription.isActive": false,
    });
  }
}

async function handleInvoicePaid(invoice) {
  const subscription = await Subscription.findOne({
    stripeCustomerId: invoice.customer,
  });

  if (subscription) {
    await Invoice.create({
      organization: subscription.organization,
      subscription: subscription._id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      status: invoice.status,
      currency: invoice.currency,
      description: invoice.description,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      paidAt: new Date(),
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
    });

    subscription.invoiceHistory.push({
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      status: invoice.status,
      paidAt: new Date(),
      invoiceUrl: invoice.hosted_invoice_url,
    });

    await subscription.save();
  }
}

async function handlePaymentFailed(invoice) {
  const subscription = await Subscription.findOne({
    stripeCustomerId: invoice.customer,
  });

  if (subscription) {
    subscription.status = "past_due";
    await subscription.save();

    await Organization.findByIdAndUpdate(subscription.organization, {
      "subscription.isActive": false,
    });
  }
}

async function handleCustomerUpdate(customer) {
  await Organization.findOneAndUpdate(
    { "subscription.stripeCustomerId": customer.id },
    {
      billingEmail: customer.email,
      billingAddress: {
        line1: customer.address?.line1,
        line2: customer.address?.line2,
        city: customer.address?.city,
        state: customer.address?.state,
        postal_code: customer.address?.postal_code,
        country: customer.address?.country,
      },
    }
  );
}

export async function getSubscription(req, res) {
  try {
    const { organizationId } = req.params;
    const userId = req.user._id;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && ["owner", "admin"].includes(m.role)
    );

    if (!userMember) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subscription = await Subscription.findOne({ organization: organizationId })
      .populate("plan");

    const invoices = await Invoice.find({ organization: organizationId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      subscription,
      invoices,
      organization: {
        name: organization.name,
        plan: subscription?.plan?.name,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function cancelSubscription(req, res) {
  try {
    const { organizationId } = req.params;
    const userId = req.user._id;

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const userMember = organization.members.find(
      m => m.user.toString() === userId.toString() && m.role === "owner"
    );

    if (!userMember) {
      return res.status(403).json({ message: "Only owner can cancel subscription" });
    }

    const subscription = await Subscription.findOne({
      organization: organizationId,
      stripeSubscriptionId: organization.subscription?.stripeSubscriptionId,
    });

    if (!subscription) {
      return res.status(400).json({ message: "No active subscription" });
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
