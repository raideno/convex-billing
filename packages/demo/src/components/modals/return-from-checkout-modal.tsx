import { AlertDialog, Button } from "@radix-ui/themes";
import React from "react";

export const ReturnFromCheckoutModal = () => {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<"success" | "cancel" | null>(null);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("return-from-checkout");
      if (value === "success" || value === "cancel") {
        setStatus(value);
        setOpen(true);
      }
    } catch (err) {
      // ignore if URL APIs unavailable
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("return-from-checkout");
      window.history.replaceState({}, document.title, url.toString());
    } catch (err) {}
  };

  if (!open || !status) return null;

  const title =
    status === "success"
      ? "Subscribed successfully"
      : "You didn't subscribe :(";
  const body =
    status === "success"
      ? "Thank you for your subscription."
      : "Why you didn't subscribe ?";

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Content>
        <>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{body}</AlertDialog.Description>
          <Button
            mt={"4"}
            className="w-full"
            variant="outline"
            onClick={handleClose}
          >
            Close
          </Button>
        </>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
