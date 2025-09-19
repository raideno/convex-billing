import {
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  Skeleton,
  Table,
} from "@radix-ui/themes";
import { useQuery } from "convex/react";

import { api } from "@/convex/api";
import { currencyToSymbol } from "./subscription-form";

export const PaymentsForm = () => {
  const products = useQuery(api.stripe.products);
  const payments = useQuery(api.stripe.payments);

  if (payments === undefined || products === undefined)
    return (
      <>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  return (
    <Box>
      <Flex direction={"column"} gap="4">
        <Heading size={"6"}>Payments</Heading>
        <Box>
          <Card style={{ padding: 0 }}>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Amount</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Mode</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {payments.length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={5} className="text-center">
                      No payments found.
                    </Table.Cell>
                  </Table.Row>
                )}
                {payments.map((payment) => {
                  const product = products.find(
                    (p) =>
                      p.prices.map((price) => price.priceId === payment.priceId)
                        .length > 0
                  );

                  const name = product
                    ? product.stripe.name
                    : "Unknown Product";

                  if (!payment.checkout) return null;

                  return (
                    <Table.Row key={payment._id}>
                      <Table.Cell>{name}</Table.Cell>
                      <Table.Cell>
                        {(
                          (payment.checkout.stripe.amount_total || 0) / 100
                        ).toFixed(2)}{" "}
                        {payment.checkout.stripe.currency
                          ? currencyToSymbol[payment.checkout.stripe.currency]
                          : "x"}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            payment.checkout.stripe.payment_status === "paid"
                              ? "green"
                              : "red"
                          }
                        >
                          {payment.checkout.stripe.payment_status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          color={
                            payment.checkout.stripe.mode === "payment"
                              ? "blue"
                              : "cyan"
                          }
                        >
                          {payment.checkout.stripe.mode}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {new Date(
                          payment.checkout.stripe.created * 1000
                        ).toLocaleDateString()}{" "}
                        -{" "}
                        {new Date(
                          payment.checkout.stripe.created * 1000
                        ).toLocaleTimeString()}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Card>
        </Box>
      </Flex>
    </Box>
  );
};
