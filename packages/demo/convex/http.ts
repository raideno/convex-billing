import { httpRouter } from "convex/server";

import { auth } from "./auth";
import { billing } from "./billing";

const http = httpRouter();

auth.addHttpRoutes(http);

// https://amicable-marmot-910.convex.site/stripe/webhook
billing.addHttpRoutes(http);

export default http;
