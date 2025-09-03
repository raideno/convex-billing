import "@radix-ui/themes/styles.css";
import "./index.css";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { Theme } from "@radix-ui/themes";
import { ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";

import { Toaster } from "./components/ui/sooner";

const address = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(address);

const container = document.getElementById("root")!;

const root = createRoot(container);

root.render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <Theme appearance="dark">
        <App />
        <Toaster />
      </Theme>
    </ConvexAuthProvider>
  </StrictMode>
);
