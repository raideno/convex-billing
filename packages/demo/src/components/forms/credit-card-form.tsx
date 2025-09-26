import { Box, Card, Flex, Heading } from "@radix-ui/themes";

export interface CreditCardProps {
  name: string;
  number: string;
  cvv: string;
  expiry: string;
}

export const CreditCard = ({ name, number, cvv, expiry }: CreditCardProps) => {
  return (
    <div className="space-y-16">
      <div className="max-w-96 w-full h-56 m-auto bg-red-100 rounded-xl relative text-white shadow-2xl transition-transform transform">
        <img
          className="relative object-cover w-full h-full rounded-xl"
          src="https://i.imgur.com/kGkSg1v.png"
        />

        <div className="w-full px-8 absolute top-8">
          <div className="flex justify-between">
            <div className="">
              <h1 className="font-light">Name</h1>
              <p className="font-medium tracking-widest">{name}</p>
            </div>
            <img className="w-14 h-14" src="https://i.imgur.com/bbPHJVe.png" />
          </div>
          <div className="pt-1">
            <h1 className="font-light">Card Number</h1>
            <p className="font-medium tracking-more-wider">{number}</p>
          </div>
          <div className="pt-6 pr-6">
            <div className="flex justify-between">
              <div className="">
                <h1 className="font-light text-xs text-xs">Expiry</h1>
                <p className="font-medium tracking-wider text-sm">{expiry}</p>
              </div>

              <div className="">
                <h1 className="font-light text-xs">CVV</h1>
                <p className="font-bold tracking-more-wider text-sm">{cvv}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreditCardForm = () => {
  return (
    <Box>
      <Flex direction="column" gap="4">
        <Heading size={"6"}>Credit Card for Stripe</Heading>
        <Card className="!py-8">
          <CreditCard
            name="Any Name"
            number="5555 5555 5555 4444"
            cvv="123"
            expiry="12/34"
          />
        </Card>
      </Flex>
    </Box>
  );
};
