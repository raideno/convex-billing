import { useAction, useQuery } from "convex/react";
import { FormEvent, useEffect, useState } from "react";

import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useAuthActions } from "@convex-dev/auth/react";
import { Box, Button, Flex, Heading, TextField } from "@radix-ui/themes";

export default function App() {
  const auth = useAuthActions();

  // const paymentId = useConsumeQueryParam("paymentId");

  // const sentMessageId = useQuery(api.payments.getMessageId, {
  //   paymentId: (paymentId ?? undefined) as Id<"payments"> | undefined,
  // });
  // const messages = useQuery(api.messages.list) || [];

  // const [newMessageText, setNewMessageText] = useState("");
  // const payAndSendMessage = useAction(api.stripe.pay);

  // async function handleSendMessage(event: FormEvent) {
  //   event.preventDefault();
  //   const paymentUrl = await payAndSendMessage({ text: newMessageText });
  //   window.location.href = paymentUrl!;
  // }

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  const handleClick = async () => {
    try {
      setLoading(true);
      if (data) {
        const response = await auth.signIn("password", data);

        console.log("[response]:", response);
      } else {
        auth.signOut();
      }
    } catch (error) {
      console.log("[error]:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Box py={"8"}>
        <Flex direction={"column"} gap={"8"}>
          <Heading>Convex Paid Chat</Heading>
          <Flex direction={"column"} gap={"4"}>
            <TextField.Root
              name="email"
              type="email"
              placeholder="Email"
              onChange={(e) =>
                setData((a) => ({
                  email: e.target.value,
                  password: a?.password || "",
                }))
              }
              value={data.email || ""}
            />
            <TextField.Root
              onChange={(e) =>
                setData((a) => ({
                  email: a?.email || "",
                  password: e.target.value,
                }))
              }
              value={data.password || ""}
              name="password"
              type="password"
              placeholder="••••••••"
            />
            <Button loading={loading} onClick={handleClick}>
              Sign In
            </Button>
          </Flex>
          {/* <ul>
        {messages.map((message) => (
          <li
            key={message._id}
            className={sentMessageId === message._id ? "sent" : ""}
          >
            <span>{message.text}</span>
            <span>{new Date(message._creationTime).toLocaleTimeString()}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          value={newMessageText}
          onChange={(event) => setNewMessageText(event.target.value)}
          placeholder="Write a message…"
        />
        <input
          type="submit"
          value="Pay $1 and send"
          disabled={newMessageText === ""}
        />
      </form> */}
        </Flex>
      </Box>
    </main>
  );
}

function useConsumeQueryParam(name: string) {
  const [value] = useState(
    new URLSearchParams(window.location.search).get(name)
  );

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    searchParams.delete(name);
    const consumedUrl =
      currentUrl.origin + currentUrl.pathname + searchParams.toString();
    window.history.replaceState(null, "", consumedUrl);
  }, []);
  return value;
}
