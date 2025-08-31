import "./index.css";
import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom";

import App from "./app";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const address = import.meta.env.VITE_CONVEX_URL;

const convex = new ConvexReactClient(address);

ReactDOM.render(
  <StrictMode>
    {/* <ConvexProvider client={convex}> */}
    <ConvexAuthProvider client={convex}>
      <Theme>
        <App />
      </Theme>
    </ConvexAuthProvider>
    {/* </ConvexProvider> */}
  </StrictMode>,
  document.getElementById("root")
);
