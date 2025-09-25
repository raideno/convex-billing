import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { useAction, useQuery } from "convex/react";
import React from "react";
import { toast } from "sonner";

import { api } from "@/convex/api";

export const currencyToSymbol: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  inr: "₹",
  // TODO: to be completed
};

export const SubscriptionForm = () => {
  const products = useQuery(api.stripe.products);
  const subscription = useQuery(api.stripe.subscription);

  const checkout = useAction(api.stripe.subscribe);

  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
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

  if (products === undefined || subscription === undefined)
    return (
      <>
        <div>from ehre</div>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  if (subscription && subscription.stripe) return null;

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size={"6"}>Select a plan</Heading>
        <Grid
          columns={{ initial: "1", sm: "2", md: "3" }}
          justify={"between"}
          gap="4"
        >
          {products.map((product) => {
            // NOTE: products can have multiple prices, but in this demo we only use one price per product, we can have one price for monthly and one for yearly
            if (product.prices.length === 0) return null;

            const price = product.prices[0];

            if (
              price.stripe.recurring === null ||
              price.stripe.unit_amount === null ||
              product.stripe.active === false
            )
              return null;

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
                    className="!w-full"
                    onClick={handleSubscribe.bind(null, price.priceId)}
                  >
                    Subscribe
                  </Button>
                </Flex>
              </Card>
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};
