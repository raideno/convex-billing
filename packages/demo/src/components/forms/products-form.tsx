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
import { currencyToSymbol } from "./subscription-form";

export const ProductsForm = () => {
  const products = useQuery(api.stripe.products);
  const purchase = useAction(api.stripe.pay);

  const [loading, setLoading] = React.useState<string | null>(null);

  const handlePay = async (priceId: string) => {
    try {
      setLoading(priceId);
      const checkout = await purchase({
        priceId: priceId,
      });

      const url = checkout.url;

      if (url) {
        window.location.href = url;
      } else {
        toast.error("Failed to create payment link.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create payment link.");
    } finally {
      setLoading(null);
    }
  };

  if (products === undefined)
    return (
      <>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size={"6"}>Products</Heading>
        <Grid
          columns={{ initial: "1", sm: "2", md: "3" }}
          justify={"between"}
          gap="4"
        >
          {products
            .filter(
              (product) =>
                product.prices.filter((price) => !price.stripe.recurring)
                  .length > 0
            )
            .map((product) => ({
              ...product,
              prices: product.prices.filter((price) => !price.stripe.recurring),
            }))
            .map((product) => {
              if (product.prices.length === 0) return null;

              const price = product.prices[0];

              price.stripe.unit_amount;

              if (
                !price.stripe.unit_amount ||
                price.stripe.unit_amount === null
              )
                return null;

              return (
                <Card key={product.productId}>
                  <Flex gap={"4"} direction={"column"} justify={"between"}>
                    <Box>
                      <Text as="div">
                        {price.stripe.unit_amount / 100}
                        {currencyToSymbol[price.stripe.currency]}
                      </Text>
                      <Heading>{product.stripe.name}</Heading>
                      <Text as="div">{product.stripe.description}</Text>
                    </Box>
                    <Button
                      disabled={loading !== null && loading !== price.priceId}
                      loading={loading === price.priceId}
                      variant="classic"
                      className="!w-full"
                      onClick={handlePay.bind(null, product.prices[0].priceId)}
                    >
                      Purchase
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
