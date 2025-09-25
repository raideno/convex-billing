import { useAuthActions } from "@convex-dev/auth/react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { useAction, useQuery } from "convex/react";
import { toast } from "sonner";

import React from "react";
import Stripe from "stripe";
import { api } from "../../../convex/_generated/api";

export const UserForm = () => {
  const auth = useAuthActions();

  const portal = useAction(api.stripe.portal);
  const products = useQuery(api.stripe.products);
  const subscription_ = useQuery(api.stripe.subscription);
  const profile = useQuery(api.profile.me);

  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSignout = async () => {
    try {
      await auth.signOut();
      toast.info("Signed out.");
    } catch (error) {
      toast.error("Failed to sign out.");
    }
  };

  const handlePortal = async () => {
    try {
      setLoading("portal");

      toast.info("Redirecting to portal...");

      const { url } = await portal();

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to create portal session.");
      }
    } catch (error) {
      toast.error("Failed to redirect to portal.");
    } finally {
      setLoading(null);
    }
  };

  if (!profile || !products || subscription_ === undefined)
    return (
      <>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  const username = (profile.email || "unknown@unknown.com").split("@")[0];

  const subscription = (subscription_?.stripe as Stripe.Subscription) || null;

  const product = subscription
    ? products.find(
        (p) => p.productId === subscription.items.data[0].price.product
      )
    : null;

  const start = subscription
    ? new Date(subscription.items.data[0].current_period_end * 1000)
    : null;
  const end = subscription
    ? new Date(subscription.items.data[0].current_period_start * 1000)
    : null;

  return (
    <Card>
      <Box>
        <Heading size={"6"}>Welcome {username}!</Heading>
        {subscription ? (
          <Heading weight={"regular"} size={"6"}>
            You are subscribed{" "}
            <Text weight={"bold"}>
              {product ? product.stripe.name : "Unknown"}
            </Text>{" "}
            Plan
          </Heading>
        ) : (
          <Heading weight={"regular"} size={"6"}>
            You are not subscribed to any plan.
          </Heading>
        )}
        <Box mt={"4"} mb={"5"}>
          {subscription && start && end && (
            <>
              <Text as="div">
                Period:{" "}
                <Text weight={"bold"}>{start.toLocaleDateString()}</Text> -{" "}
                <Text weight={"bold"}>{end.toLocaleDateString()}</Text>
              </Text>
              <Text as="div">
                Status: <Text weight={"bold"}>{subscription.status}</Text>
              </Text>
              <Text as="div">
                Will be canceled at period end:{" "}
                <Text weight={"bold"}>
                  {String(subscription.cancel_at_period_end)}
                </Text>
              </Text>
            </>
          )}
        </Box>
        <Flex direction={"column"} gap={"3"}>
          {subscription && (
            <Button
              className="!w-full"
              variant="classic"
              onClick={handlePortal}
              loading={loading === "portal"}
            >
              Manage Subscription
            </Button>
          )}
          <Button
            className="!w-full"
            color="red"
            variant="soft"
            onClick={handleSignout}
          >
            Signout
          </Button>
        </Flex>
      </Box>
    </Card>
  );
};
