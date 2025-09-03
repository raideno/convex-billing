import { Box, Button, Card, Flex, Heading, Link, Text } from "@radix-ui/themes";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

import { AuthForm } from "./components/forms/auth-form";
import { SubscriptionForm } from "./components/forms/subscription-form";
import { UserForm } from "./components/forms/user-form";
import { ReturnFromCheckoutModal } from "./components/modals/return-from-checkout-modal";
import { ReturnFromPortalModal } from "./components/modals/return-from-portal-modal";

export default function App() {
  return (
    <main>
      <Box mb={"8"}>
        <Heading size={"7"}>Convex Stripe Integration Demo</Heading>
        <Text>
          Visit documentation at{" "}
          <Link
            href="https://github.com/raideno/convex-billing"
            target="_blank"
          >
            https://github.com/raideno/convex-billing
          </Link>
          .
        </Text>
      </Box>
      <Box mb={"8"}>
        <Card>
          <Flex direction={"column"} gap={"2"}>
            <Link
              href="https://raideno.github.io/convex-billing/"
              target="_blank"
            >
              <Button variant="classic" className="w-full">
                Documentation
              </Button>
            </Link>
            <Link
              href="https://github.com/raideno/convex-billing"
              target="_blank"
            >
              <Button variant="classic" className="w-full">
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
          <div>Loading...</div>
        </Box>
      </AuthLoading>
      <Authenticated>
        <Flex direction={"column"} gap="6">
          <UserForm />
          <SubscriptionForm />
        </Flex>
        <ReturnFromCheckoutModal />
        <ReturnFromPortalModal />
      </Authenticated>
    </main>
  );
}
