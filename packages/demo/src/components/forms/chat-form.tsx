import { api } from "@/convex/api";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  ScrollArea,
  Text,
  TextArea,
} from "@radix-ui/themes";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import React from "react";

export const ChatForm = () => {
  const messages = useQuery(api.chat.list);
  const post = useMutation(api.chat.post);

  const [value, setValue] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null);
  const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const viewport = document.querySelector(
          "[data-radix-scroll-area-viewport]"
        ) as HTMLElement;
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "instant",
          });
        }
      }
    };

    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const handleSend = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!value.trim()) return;

    if (value.length > 320) return;

    try {
      setSending(true);

      await post({ message: value.trim() });

      setValue("");

      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);

      setTimeout(() => {
        if (scrollAreaRef.current) {
          const viewport = document.querySelector(
            "[data-radix-scroll-area-viewport]"
          ) as HTMLElement;
          if (viewport) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          }
        }
      }, 200);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size="6">Chat (demo)</Heading>
        <Card>
          <Flex direction="column" gap="3" style={{ maxHeight: 360 }}>
            <ScrollArea type="auto" style={{ height: 240 }} ref={scrollAreaRef}>
              <Flex direction="column" gap="3" p="2">
                {messages === undefined && <Text>Loading messages...</Text>}
                {messages && messages.length === 0 && (
                  <Text color="gray">No messages yet.</Text>
                )}
                {messages &&
                  messages.map((m) => (
                    <Box
                      key={m._id}
                      style={{
                        paddingBottom: 4,
                      }}
                    >
                      <Flex align="center" gap="2" wrap="wrap">
                        <Text weight="bold">{m.name}</Text>
                        <Badge color="blue" radius="full">
                          {m.planName || "No plan"}
                        </Badge>
                        <Badge color="green" radius="full">
                          payments: {m.successfulPayments}
                        </Badge>
                        <Text size="1" color="gray">
                          {new Date(m._creationTime).toLocaleTimeString()}
                        </Text>
                      </Flex>
                      <Text as="div" size="2">
                        {m.message}
                      </Text>
                    </Box>
                  ))}
              </Flex>
            </ScrollArea>
            <Authenticated>
              <form onSubmit={handleSend} className="flex flex-col gap-2">
                <TextArea
                  ref={textAreaRef}
                  placeholder="Type a message (max 320 chars). Press Enter to send, Shift+Enter for new line."
                  value={value}
                  onChange={(e) => setValue(e.target.value.slice(0, 320))}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  rows={3}
                />
                <Flex justify="between" align="center">
                  <Text size="1" color={value.length > 300 ? "red" : "gray"}>
                    {value.length}/320
                  </Text>
                  <Button
                    type="submit"
                    variant="classic"
                    disabled={sending || value.trim().length === 0}
                    loading={sending}
                  >
                    Send
                  </Button>
                </Flex>
              </form>
            </Authenticated>
            <Unauthenticated>
              <Box px="2" pb="3">
                <Text size="2" color="gray">
                  Log in to participate in the chat.
                </Text>
              </Box>
            </Unauthenticated>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
};
