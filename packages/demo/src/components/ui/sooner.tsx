"use client";

import { useThemeContext } from "@radix-ui/themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeContext();

  return (
    <Sonner
      theme={theme.appearance === "dark" ? "dark" : "light"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-panel-solid)",
          "--normal-text": "var(--white)",
          "--normal-border": "var(--gray-7)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
