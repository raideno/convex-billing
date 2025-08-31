import { internalConvexBilling } from "@raideno/convex-billing/src/server";

import configuration from "./billing.config";
import { internal } from "../_generated/api";
import Stripe from "stripe";

export const {
  billing,
  // --- stripe
  getPortal: getPortal_, // *
  checkout: checkout_, // *
  createStripeCustomer,
  sync,
  getSubscription: getSubscription_, // *
  webhook,
  getPlans: getPlans_, // *
  // --- metadata
  getLimits: getLimits_, // *
  getFeatures: getFeatures_, // *
} = internalConvexBilling(configuration);

export type STRIPE_SUB_CACHE =
  | {
      subscriptionId: string;
      status: Stripe.Subscription.Status;
      priceId: string;
      currentPeriodStart: number;
      currentPeriodEnd: number;
      cancelAtPeriodEnd: boolean;
      limits: Record<string, number>;
      paymentMethod: {
        brand: string | null;
        last4: string | null;
      } | null;
    }
  | {
      status: "none";
    };
