import { httpRouter } from "convex/server";

import { auth } from "./auth";
import { stripe } from "./stripe";

const http = httpRouter();

auth.addHttpRoutes(http);

// https://amicable-marmot-910.convex.site/stripe/webhook
stripe.addHttpRoutes(http);

export default http;
