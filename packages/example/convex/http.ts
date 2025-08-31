import { httpRouter } from "convex/server";

import { auth } from "./auth";
import { billing } from "./billing/private";

const http = httpRouter();

auth.addHttpRoutes(http);

// https://modest-chipmunk-615.convex.cloud
// https://modest-chipmunk-615.convex.site/stripe/webhook
billing.addHttpRoutes(http);

export default http;
