import { httpRouter, RoutableMethod } from "convex/server";

import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { stripe } from "./stripe";

const http = httpRouter();

auth.addHttpRoutes(http);

// https://amicable-marmot-910.convex.site/stripe/webhook
http.route({
  path: stripe.http.webhook.path,
  method: stripe.http.webhook.method as RoutableMethod,
  handler: httpAction(async (context, request) => {
    // 1- retrieve the stripe key depending on the url
    // 2- create the stripe client
    // 3- pass the client to the handler
    return await stripe.http.webhook.handler(context, request);
    // 4- handler will verify the signature and process the event
    // TODO: 5- we need a way for the handler to save the accountId or something to know from which account the object / secret key came from if people need to do that
  }),
});

// https://amicable-marmot-910.convex.site/stripe/return/*
http.route({
  pathPrefix: stripe.http.redirect.pathPrefix,
  method: stripe.http.redirect.method as RoutableMethod,
  handler: httpAction(async (context, request) => {
    return await stripe.http.redirect.handler(context, request);
  }),
});

export default http;
