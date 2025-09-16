# Convex Stripe Demo

This is a demo app that demonstrates how to use the [Convex Stripe](https://github.com/raideno/convex-stripe-component) package.

Before running the demo, make sure the following environment variables are configured in your convex project:

```bash
npx convex env set STRIPE_SECRET_KEY "<your-stripe-secret-key>"
npx convex env set STRIPE_WEBHOOK_SECRET "<your-stripe-webhook-secret>"
npx convex env set JWKS "<your-jwks>"
npx convex env set JWT_PRIVATE_KEY "<your-jwt-private-key>"
npx convex env set SITE_URL "http://localhost:5173"
```

You can get the `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from your Stripe dashboard.

The `JWKS` and `JWT_PRIVATE_KEY` can be generated using by following the [Convex Auth Documentation](https://labs.convex.dev/auth/setup/manual#configure-private-and-public-key).
