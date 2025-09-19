import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { AuthForm } from "./components/forms/auth-form";
import { CreditCardForm } from "./components/forms/credit-card-form";
import { PaymentsForm } from "./components/forms/payments-form";
import { ProductsForm } from "./components/forms/products-form";
import { SubscriptionForm } from "./components/forms/subscription-form";
import { UserForm } from "./components/forms/user-form";
import { GenericReturnFromModal } from "./components/modals/generic-return-from-modal";

export default function App() {
  return (
    <main>
      <Box mb={"8"}>
        <Heading size={"7"}>Convex Stripe Integration Demo</Heading>
        <Text>
          Visit documentation at{" "}
          <Link href="https://github.com/raideno/convex-stripe" target="_blank">
            https://github.com/raideno/convex-stripe
          </Link>
          .
        </Text>
      </Box>
      <Box mb={"8"}>
        <Card>
          <Flex direction={"column"} gap={"2"}>
            <Link
              href="https://github.com/raideno/convex-stripe/tree/main/packages/demo"
              target="_blank"
            >
              <Button variant="classic" className="!w-full">
                Code
              </Button>
            </Link>
            <Link
              href="https://raideno.github.io/convex-stripe/"
              target="_blank"
            >
              <Button variant="classic" className="!w-full">
                Documentation
              </Button>
            </Link>
            <Link
              href="https://github.com/raideno/convex-stripe"
              target="_blank"
            >
              <Button variant="classic" className="!w-full">
                Github
              </Button>
            </Link>
          </Flex>
        </Card>
      </Box>
      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
      <AuthLoading>
        <Box>
          <Skeleton style={{ width: "100%", height: "256px" }} />
        </Box>
      </AuthLoading>
      <Authenticated>
        <Flex direction={"column"} gap="6">
          <UserForm />
          <CreditCardForm />
          <SubscriptionForm />
          <ProductsForm />
          <PaymentsForm />
        </Flex>
        <GenericReturnFromModal />
      </Authenticated>
    </main>
  );
}
