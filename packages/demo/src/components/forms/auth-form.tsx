import { useAuthActions } from "@convex-dev/auth/react";
import { Box, Button, Card, Flex, Heading, TextField } from "@radix-ui/themes";
import React from "react";
import { toast } from "sonner";

export const AuthForm = () => {
  const { signIn } = useAuthActions();

  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<"signUp" | "signIn">("signIn");

  const handleSubmission = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      event.preventDefault();
      const response = await signIn(
        "password",
        new FormData(event.currentTarget)
      );

      if (!response.signingIn) throw new Error("Authentication failed");

      toast.success("Welcome!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card>
        <form onSubmit={handleSubmission}>
          <Flex direction="column" gap="4">
            <Heading size="6">Welcome</Heading>
            <TextField.Root name="email" placeholder="Email" type="text" />
            <TextField.Root
              name="password"
              placeholder="Password"
              type="password"
            />
            <TextField.Root name="flow" type="hidden" value={step} />
            <Button loading={loading} variant="classic" type="submit">
              {step === "signIn" ? "Sign in" : "Sign up"}
            </Button>
            <Button
              type="button"
              variant="soft"
              onClick={() => {
                setStep(step === "signIn" ? "signUp" : "signIn");
              }}
            >
              {step === "signIn" ? "Sign up instead" : "Sign in instead"}
            </Button>
          </Flex>
        </form>
      </Card>
    </Box>
  );
};
