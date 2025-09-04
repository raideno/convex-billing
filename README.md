# Convex Stripe Billing

A demo project is available at [https://convex-billing-demo.vercel.app/](https://convex-billing-demo.vercel.app/).

Stripe subscriptions, limits and features for Convex apps.
Implemented according to the best practices listed in [Stripe Recommendations](https://github.com/t3dotgg/stripe-recommendations).

## Install

```bash
npm install @raideno/convex-billing stripe
```

## Documentation

You can find the detailed documentation @ [https://raideno.github.io/convex-billing](https://raideno.github.io/convex-billing).

## TODOs

- [ ] Implement one time payment endpoint.
- [ ] Show an example app for subscription and one time payments with credits usage.

## Development

Clone the repository:

```bash
git clone git@github.com:raideno/convex-billing.git
cd convex-billing
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
# automatically rebuild lib on changes
npm run dev --workspace @raideno/convex-billing
# run the demo app
npm run dev --workspace demo
```

## Contributions

All contributions are welcome! Please open an issue or a PR.
