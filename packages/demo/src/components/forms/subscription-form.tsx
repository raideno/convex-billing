import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
  Card,
  Code,
  Flex,
  Heading,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { useAction, useQuery } from "convex/react";
import React from "react";
import { toast } from "sonner";

import { api } from "@/convex/api";
import Stripe from "stripe";

const currencyToSymbol: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  inr: "₹",
  // TODO: to be completed
};

export const SubscriptionForm = () => {
  const products = useQuery(api.billing.products);
  const subscription = useQuery(api.billing.subscription);

  const portal = useAction(api.billing.portal);
  const checkout = useAction(api.billing.checkout);

  const [loading, setLoading] = React.useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    try {
      setLoading(priceId);
      if (!priceId) {
        toast.error("Please select a plan.");
        return;
      }

      const { url } = await checkout({ priceId });

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to create checkout session.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create checkout session.");
    } finally {
      setLoading(null);
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

  if (products === undefined || subscription === undefined)
    return (
      <>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  if (subscription && subscription.stripe) {
    const sub = subscription.stripe as Stripe.Subscription;

    const product = products.find(
      (p) => p.productId === sub.items.data[0].price.product
    );

    const start = new Date(sub.items.data[0].current_period_end * 1000);
    const end = new Date(sub.items.data[0].current_period_start * 1000);

    return (
      <Card>
        <Box>
          <Heading size={"6"}>You are already subscribed</Heading>
          <Box mt={"4"} mb={"5"}>
            <Text as="div">
              You are currently subscribed to the{" "}
              <Text weight={"bold"}>
                {product ? product.stripe.name : "Unknown Plan"}
              </Text>{" "}
              Plan.
            </Text>
            <Text as="div">
              Period: <Text weight={"bold"}>{start.toLocaleDateString()}</Text>{" "}
              - <Text weight={"bold"}>{end.toLocaleDateString()}</Text>
            </Text>
            <Text as="div">
              Status: <Text weight={"bold"}>{sub.status}</Text>
            </Text>
            <Text as="div">
              Will be canceled at period end:{" "}
              <Text weight={"bold"}>{String(sub.cancel_at_period_end)}</Text>
            </Text>
          </Box>
          <Button
            className="w-full"
            variant="classic"
            onClick={handlePortal}
            loading={loading === "portal"}
          >
            Manage Subscription
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size={"6"}>Select a plan</Heading>
        <Callout.Root>
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Stripe is in test mode. Use the card{" "}
            <Code>5555 5555 5555 4444</Code> with any future date and any CVC
            code.
          </Callout.Text>
        </Callout.Root>
        <Flex direction={{ initial: "column", md: "row" }} gap="4">
          {products.map((product) => {
            // NOTE: products can have multiple prices, but in this demo we only use one price per product, we can have one price for monthly and one for yearly
            if (product.prices.length === 0) return null;

            const price = product.prices[0];

            if (price.stripe.unit_amount === null) return null;

            if (product.stripe.active === false) return null;

            return (
              <Card key={price.priceId}>
                <Flex direction={"column"} gap={"6"}>
                  <Text size={"6"} weight={"bold"}>
                    {price.stripe.unit_amount / 100}
                    {currencyToSymbol[price.stripe.currency]}
                  </Text>
                  <Box>
                    <Heading>{product.stripe.name}</Heading>
                    <Text as="div">{product.stripe.description}</Text>
                  </Box>
                  <Flex direction={"column"}>
                    {(product.stripe.marketing_features || []).map(
                      (feature, index) =>
                        feature.name && (
                          <Text key={index}>- {feature.name}</Text>
                        )
                    )}
                  </Flex>
                  <Button
                    variant="classic"
                    disabled={loading !== null && loading !== price.priceId}
                    loading={loading === price.priceId}
                    className="w-full"
                    onClick={handleCheckout.bind(null, price.priceId)}
                  >
                    Subscribe
                  </Button>
                </Flex>
              </Card>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};
