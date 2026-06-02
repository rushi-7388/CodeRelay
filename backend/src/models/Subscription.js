import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  interval: {
    type: String,
    enum: ["month", "year"],
    default: "month",
  },
  features: [{
    name: String,
    included: Boolean,
    limit: Number,
  }],
  limits: {
    maxStudents: {
      type: Number,
      default: 50,
    },
    maxTeachers: {
      type: Number,
      default: 5,
    },
    maxClassrooms: {
      type: Number,
      default: 10,
    },
    maxProblems: {
      type: Number,
      default: 100,
    },
    maxContests: {
      type: Number,
      default: 5,
    },
    storageGB: {
      type: Number,
      default: 1,
    },
    aiFeatures: {
      type: Boolean,
      default: false,
    },
    customBranding: {
      type: Boolean,
      default: false,
    },
    prioritySupport: {
      type: Boolean,
      default: false,
    },
    apiAccess: {
      type: Boolean,
      default: false,
    },
    advancedAnalytics: {
      type: Boolean,
      default: false,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  stripePriceId: {
    type: String,
  },
  stripeYearlyPriceId: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
  },
  stripeCustomerId: {
    type: String,
  },
  stripePriceId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "canceled", "past_due", "trialing", "unpaid", "paused"],
    default: "trialing",
  },
  currentPeriodStart: {
    type: Date,
  },
  currentPeriodEnd: {
    type: Date,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  canceledAt: {
    type: Date,
  },
  trialStart: {
    type: Date,
  },
  trialEnd: {
    type: Date,
  },
  usage: {
    students: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 50 },
    },
    teachers: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 5 },
    },
    classrooms: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 10 },
    },
    storage: {
      current: { type: Number, default: 0 },
      limit: { type: Number, default: 1 },
    },
  },
  billingEmail: {
    type: String,
  },
  billingAddress: {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postal_code: String,
    country: String,
  },
  invoiceHistory: [
    {
      invoiceId: String,
      amount: Number,
      status: String,
      paidAt: Date,
      invoiceUrl: String,
    },
  ],
  paymentMethod: {
    type: { type: String },
    last4: String,
    brand: String,
    expMonth: Number,
    expYear: Number,
  },
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
  },
  stripeInvoiceId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "open", "paid", "void", "uncollectible"],
    required: true,
  },
  currency: {
    type: String,
    default: "usd",
  },
  description: String,
  periodStart: Date,
  periodEnd: Date,
  paidAt: Date,
  invoiceUrl: String,
  pdfUrl: String,
}, { timestamps: true });

const Plan = mongoose.model("Plan", planSchema);
const Subscription = mongoose.model("Subscription", subscriptionSchema);
const Invoice = mongoose.model("Invoice", invoiceSchema);

export { Plan, Subscription, Invoice };
