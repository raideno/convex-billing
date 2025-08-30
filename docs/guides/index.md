---
outline: deep
---

# Guides

These guides show how to integrate subscriptions, limits, and usage counters
using Stripe + Convex with this package.

## Overview

- Entity-centric. You pass an `entityId` for all billing operations. It can be
  a user id or an organization id.
- Stripe Customer is created once per entity and stored in KV.
- Subscription data is cached in KV and kept in sync by a Stripe webhook and a
  periodic/manual `sync` call.
- Limits and features are read from Stripe Price metadata using prefixes:
  - Limits prefix: `limits:`
  - Features prefix: `features:`
- Usage is tracked per entity per billing period per named counter. It uses a
  KV key with TTL that expires at the end of the period.
- Consumption can be enforced against the active subscription limit.

## Pick a guide

- [User Based Billing](/guides/user-based-billing)
- [Organization Based Billing](/guides/organization-based-billing)

## What you get

- Hosted checkout and customer portal URLs.
- Subscriptions cache with payment method summary.
- Plan discovery from Stripe Prices.
- Named usage counters with atomic increments and optional enforcement.

See the README for installation and configuration.
