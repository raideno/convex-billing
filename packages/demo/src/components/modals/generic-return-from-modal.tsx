import { AlertDialog, Button } from "@radix-ui/themes";
import React from "react";

export const RETURN_FROM: Record<
  string,
  Record<string, { title: string; body: string }>
> = {
  "return-from-checkout": {
    success: {
      title: "Subscribed successfully",
      body: "Thank you for your subscription.",
    },
    cancel: {
      title: "You didn't subscribe :(",
      body: "Why you didn't subscribe ?",
    },
  },
  "return-from-portal": {
    success: {
      title: "Success",
      body: "Your changes in the Stripe portal were applied successfully if any were made.",
    },
  },
  "return-from-pay": {
    success: {
      title: "Payment successful",
      body: "Thank you for your payment.",
    },
    cancel: {
      title: "You didn't pay :(",
      body: "Why you didn't pay ?",
    },
  },
};

export const GenericReturnFromModal = () => {
  const [open, setOpen] = React.useState(true);

  const params = new URLSearchParams(window.location.search);

  const key = Array.from(params.keys())[0]!;
  const value = params.get(key || "")!;

  if (!key || !value || !(key in RETURN_FROM) || !(value in RETURN_FROM[key]))
    return null;

  const title = RETURN_FROM[key][value].title;
  const body = RETURN_FROM[key][value].body;

  const handleClose = () => {
    setOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("return-from-checkout");
      window.history.replaceState({}, document.title, url.toString());
    } catch (err) {}
  };

  if (!open) return null;

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Content>
        <>
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description>{body}</AlertDialog.Description>
          <Button
            mt={"4"}
            className="!w-full"
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
