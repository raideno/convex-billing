---
outline: deep
---

# Guides

These guides show how to integrate subscriptions using Stripe + Convex with this package.

## Overview

- Entity-centric. You pass an `entityId` for all billing operations. It can be
  a user id or an organization id.
- Stripe Customer is created once per entity and stored in KV.
- Subscription data is cached in KV and kept in sync by a Stripe webhook and a

## Pick a guide

- [User Based Billing](/guides/user-based-billing)
- [Organization Based Billing](/guides/organization-based-billing)

## What you get

- Hosted checkout and customer portal URLs.
- Subscriptions cache with payment method summary.
- Plan discovery from Stripe Prices.

See the README for installation and configuration.
