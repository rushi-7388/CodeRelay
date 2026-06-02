import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Plan } from "../src/models/Subscription.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const plans = [
    {
        name: "Starter",
        slug: "starter",
        description: "Perfect for small teams getting started with collaborative coding.",
        price: 49,
        interval: "month",
        features: [
            { name: "Up to 5 Team Members", included: true },
            { name: "100 Live Sessions/mo", included: true },
            { name: "Basic Analytics", included: true },
            { name: "Community Support", included: true },
        ],
        limits: {
            maxStudents: 50,
            maxTeachers: 5,
            maxClassrooms: 10,
        },
        isPopular: false,
        order: 1,
        stripePriceId: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
        stripeYearlyPriceId: process.env.STRIPE_STARTER_YEARLY_PRICE_ID,
    },
    {
        name: "Pro",
        slug: "pro",
        description: "Advanced features and capabilities for professional engineering teams.",
        price: 149,
        interval: "month",
        features: [
            { name: "Unlimited Team Members", included: true },
            { name: "Unlimited Live Sessions", included: true },
            { name: "Advanced AI Assistance", included: true },
            { name: "Priority Support", included: true },
            { name: "Custom Classrooms", included: true },
        ],
        limits: {
            maxStudents: 500,
            maxTeachers: 50,
            maxClassrooms: 100,
            aiFeatures: true,
            prioritySupport: true,
        },
        isPopular: true,
        order: 2,
        stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
        stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
    {
        name: "Enterprise",
        slug: "enterprise",
        description: "Custom solutions for massive scale and complex needs.",
        price: 499,
        interval: "month",
        features: [
            { name: "SSO Integration", included: true },
            { name: "Dedicated Account Manager", included: true },
            { name: "White-labeling", included: true },
            { name: "On-premise deployment support", included: true },
            { name: "SLA Guarantee", included: true },
        ],
        limits: {
            maxStudents: 10000,
            maxTeachers: 1000,
            maxClassrooms: 1000,
            aiFeatures: true,
            prioritySupport: true,
            customBranding: true,
            apiAccess: true,
            advancedAnalytics: true,
        },
        isPopular: false,
        order: 3,
        stripePriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
        stripeYearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB database.");

        // clear existing plans
        await Plan.deleteMany({});
        console.log("Cleared existing plans.");

        // insert plans
        await Plan.insertMany(plans);
        console.log("Successfully seeded database with subscription plans.");

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding plans database:", error);
        process.exit(1);
    }
}

seedDatabase();
