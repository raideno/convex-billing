import { useAction, useQuery } from "convex/react";

import { api } from "@/convex/api";

export const ProductsForm = () => {
  const intents = useQuery(api.stripe.payments);
  const products = useQuery(api.stripe.products);
  const purchase = useAction(api.stripe.pay);

  const handlePurchase = async (priceId: string) => {
    const checkout = await purchase({
      priceId: priceId,
    });

    console.log("[checkout]:", checkout);

    const url = checkout.url;

    if (!url) {
      return;
    }

    window.location.href = url;
  };

  if (!products) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>Payments</div>
      <div></div>
      <div>Products Form</div>
      <div>
        {products
          .filter(
            (product) =>
              product.prices.filter((price) => !price.stripe.recurring).length >
              0
          )
          .map((product) => ({
            ...product,
            prices: product.prices.filter((price) => !price.stripe.recurring),
          }))
          .map((product) => {
            return (
              <div key={product._id}>
                <div>
                  {product.stripe.name} ({product.prices.length} different
                  prices)
                </div>
                <button
                  onClick={(event) => handlePurchase(product.prices[0].priceId)}
                >
                  Purchase
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};
