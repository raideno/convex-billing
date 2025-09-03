import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  RadioCards,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { useAction, useQuery } from "convex/react";
import React from "react";
import { toast } from "sonner";

import { api } from "../../../convex/_generated/api";

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

  const [loading, setLoading] = React.useState(false);
  const [priceId, setPriceId] = React.useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    try {
      setLoading(true);

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
      setLoading(false);
    }
  };

  if (products === undefined || subscription === undefined)
    return (
      <>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  if (subscription)
    return (
      <Card>
        <Flex direction="column" gap="4">
          <Heading size={"6"}>You are already subscribed</Heading>
          <Text>
            You are currently subscribed to the plan with price ID:{" "}
            {subscription._id}
          </Text>
          <Button variant="classic" onClick={handlePortal} loading={loading}>
            Manage Subscription
          </Button>
        </Flex>
      </Card>
    );

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size={"6"}>Select a plan</Heading>
        <RadioCards.Root
          value={priceId}
          onValueChange={(value) => setPriceId(value)}
        >
          {products.map((product) => {
            // NOTE: products can have multiple prices, but in this demo we only use one price per product, we can have one price for monthly and one for yearly
            if (product.prices.length === 0) return null;

            const price = product.prices[0];

            if (price.unit_amount === null) return null;

            return (
              <RadioCards.Item key={price.priceId} value={price.priceId}>
                <Flex direction={"column"} gap={"2"}>
                  <Text size={"1"} weight={"bold"}>
                    {price.unit_amount / 100}
                    {currencyToSymbol[price.currency]}
                  </Text>
                  <Heading size={"3"}>{product.name}</Heading>
                  <Text>{product.description}</Text>
                </Flex>
              </RadioCards.Item>
            );
          })}
        </RadioCards.Root>
        <Button variant="classic" loading={loading} onClick={handleCheckout}>
          Subscribe
        </Button>
      </Flex>
    </Box>
  );
};
