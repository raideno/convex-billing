# Billing

The implementation of billing and subscription management uses stripe and a kv-store to cache subscription status.
It follows the pattern and best practices described in [Theo's T3 Gg Github Repository](https://github.com/t3dotgg/stripe-recommendations).

In order to use the code, copy the entire billing directory as well as the `http.ts` file which is used to register the stripe webhook endpoint.
