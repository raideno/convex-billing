import { AlertDialog, Button } from "@radix-ui/themes";
import React from "react";

export const ReturnFromPortalModal = () => {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<"success" | "cancel" | null>(null);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("return-from-portal");
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
      url.searchParams.delete("return-from-portal");
      window.history.replaceState({}, document.title, url.toString());
    } catch (err) {}
  };

  if (!open || !status) return null;

  const title = status === "success" ? "Success" : "Action canceled";
  const body =
    status === "success"
      ? "Your changes in the Stripe portal were applied successfully."
      : "You returned from the Stripe portal without making changes.";

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Content>
        <>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{body}</AlertDialog.Description>
          <Button
            mt={"4"}
            className="w-full"
            variant="classic"
            onClick={handleClose}
          >
            Close
          </Button>
        </>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
