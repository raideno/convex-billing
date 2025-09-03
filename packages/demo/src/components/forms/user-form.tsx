import { useAuthActions } from "@convex-dev/auth/react";
import { Box, Button, Card, Flex, Heading, Skeleton } from "@radix-ui/themes";
import { useQuery } from "convex/react";
import { toast } from "sonner";

import { api } from "../../../convex/_generated/api";

export const UserForm = () => {
  const auth = useAuthActions();

  const profile = useQuery(api.profile.me);

  const handleSignout = async () => {
    try {
      await auth.signOut();
      toast.info("Signed out.");
    } catch (error) {
      toast.error("Failed to sign out.");
    }
  };

  if (!profile)
    return (
      <>
        <Skeleton style={{ width: "100%", height: "102px" }} />
      </>
    );

  const username = (profile.email || "unknown@unknown.com").split("@")[0];

  return (
    <Box>
      <Card>
        <Flex direction="column" gap="4">
          <Heading size={"6"}>Welcome {username}!</Heading>
          <Button color="red" variant="soft" onClick={handleSignout}>
            Signout
          </Button>
        </Flex>
      </Card>
    </Box>
  );
};
