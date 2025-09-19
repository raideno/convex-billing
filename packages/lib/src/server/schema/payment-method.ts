import { Infer, v } from "convex/values";
import Stripe from "stripe";

import { metadata, nullablestring } from "@/helpers";

export const PaymentMethodStripeToConvex = (
  paymentMethod: Stripe.PaymentMethod
) => {
  const object: Infer<typeof PaymentMethodObject> = {
    id: paymentMethod.id,
    billing_details: paymentMethod.billing_details,
    customer:
      typeof paymentMethod.customer === "string"
        ? paymentMethod.customer
        : (paymentMethod.customer?.id ?? null),
    metadata: paymentMethod.metadata,
    type: paymentMethod.type,
    object: paymentMethod.object,
    acss_debit: paymentMethod.acss_debit ?? null,
    affirm: paymentMethod.affirm ?? null,
    afterpay_clearpay: paymentMethod.afterpay_clearpay ?? null,
    alipay: paymentMethod.alipay ?? null,
    allow_redisplay: paymentMethod.allow_redisplay ?? null,
    alma: paymentMethod.alma ?? null,
    amazon_pay: paymentMethod.amazon_pay ?? null,
    au_becs_debit: paymentMethod.au_becs_debit ?? null,
    bacs_debit: paymentMethod.bacs_debit ?? null,
    bancontact: paymentMethod.bancontact ?? null,
    billie: paymentMethod.billie ?? null,
    blik: paymentMethod.blik ?? null,
    boleto: paymentMethod.boleto ?? null,
    card: paymentMethod.card ?? null,
    card_present: paymentMethod.card_present ?? null,
    cashapp: paymentMethod.cashapp ?? null,
    created: paymentMethod.created,
    crypto: paymentMethod.crypto ?? null,
    customer_balance: paymentMethod.customer_balance ?? null,
    eps: paymentMethod.eps ?? null,
    fpx: paymentMethod.fpx ?? null,
    giropay: paymentMethod.giropay ?? null,
    grabpay: paymentMethod.grabpay ?? null,
    ideal: paymentMethod.ideal ?? null,
    interac_present: paymentMethod.interac_present ?? null,
    kakao_pay: paymentMethod.kakao_pay ?? null,
    klarna: paymentMethod.klarna ?? null,
    konbini: paymentMethod.konbini ?? null,
    kr_card: paymentMethod.kr_card ?? null,
    link: paymentMethod.link ?? null,
    livemode: paymentMethod.livemode,
    mobilepay: paymentMethod.mobilepay ?? null,
    multibanco: paymentMethod.multibanco ?? null,
    naver_pay: paymentMethod.naver_pay ?? null,
    nz_bank_account: paymentMethod.nz_bank_account ?? null,
    oxxo: paymentMethod.oxxo ?? null,
    p24: paymentMethod.p24 ?? null,
    pay_by_bank: paymentMethod.pay_by_bank ?? null,
    payco: paymentMethod.payco ?? null,
    paynow: paymentMethod.paynow ?? null,
    paypal: paymentMethod.paypal ?? null,
    pix: paymentMethod.pix ?? null,
    promptpay: paymentMethod.promptpay ?? null,
    radar_options: paymentMethod.radar_options ?? null,
    revolut_pay: paymentMethod.revolut_pay ?? null,
    samsung_pay: paymentMethod.samsung_pay ?? null,
    satispay: paymentMethod.satispay ?? null,
    sepa_debit: paymentMethod.sepa_debit ?? null,
    sofort: paymentMethod.sofort ?? null,
    swish: paymentMethod.swish ?? null,
    twint: paymentMethod.twint ?? null,
    us_bank_account: paymentMethod.us_bank_account ?? null,
    wechat_pay: paymentMethod.wechat_pay ?? null,
    zip: paymentMethod.zip ?? null,
  };
  return object;
};

export const PaymentMethodSchema = {
  id: v.string(),
  // billing_details: optionalnullableobject({
  //     // TODO: complete
  // }),
  billing_details: v.optional(v.any()),
  customer: v.optional(nullablestring()),
  metadata: v.optional(v.union(metadata(), v.null())),
  type: v.string(),
  object: v.string(),
  //   acss_debit: optionalnullableobject({
  //     // TODO: complete
  //   }),
  acss_debit: v.optional(v.any()),
  //   affirm: optionalnullableobject({
  //     // TODO: complete
  //   }),
  affirm: v.optional(v.any()),
  //   afterpay_clearpay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  afterpay_clearpay: v.optional(v.any()),
  //   alipay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  alipay: v.optional(v.any()),
  allow_redisplay: v.union(
    v.literal("always"),
    v.literal("limited"),
    v.literal("unspecified"),
    v.null()
  ),
  //   alma: optionalnullableobject({
  //     // TODO: complete
  //   }),
  alma: v.optional(v.any()),
  //   amazon_pay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  amazon_pay: v.optional(v.any()),
  //   au_becs_debit: optionalnullableobject({
  //     // TODO: complete
  //   }),
  au_becs_debit: v.optional(v.any()),
  //   bacs_debit: optionalnullableobject({
  //     // TODO: complete
  //   }),
  bacs_debit: v.optional(v.any()),
  //   bancontact: optionalnullableobject({
  //     // TODO: complete
  //   }),
  bancontact: v.optional(v.any()),
  //   billie: optionalnullableobject({
  //     // TODO: complete
  //   }),
  billie: v.optional(v.any()),
  //   blik: optionalnullableobject({
  //     // TODO: complete
  //   }),
  blik: v.optional(v.any()),
  //   boleto: optionalnullableobject({
  //     // TODO: complete
  //   }),
  boleto: v.optional(v.any()),
  //   card: optionalnullableobject({
  //     // TODO: complete
  //   }),
  card: v.optional(v.any()),
  //   card_present: optionalnullableobject({
  //     // TODO: complete
  //   }),
  card_present: v.optional(v.any()),
  //   cashapp: optionalnullableobject({
  //     // TODO: complete
  //   }),
  cashapp: v.optional(v.any()),
  created: v.number(),
  //   crypto: optionalnullableobject({
  //     // TODO: complete
  //   }),
  crypto: v.optional(v.any()),
  //   customer_balance: optionalnullableobject({
  //     // TODO: complete
  //   }),
  customer_balance: v.optional(v.any()),
  //   eps: optionalnullableobject({
  //     // TODO: complete
  //   }),
  eps: v.optional(v.any()),
  //   fpx: optionalnullableobject({
  //     // TODO: complete
  //   }),
  fpx: v.optional(v.any()),
  //   giropay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  giropay: v.optional(v.any()),
  //   grabpay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  grabpay: v.optional(v.any()),
  //   ideal: optionalnullableobject({
  //     // TODO: complete
  //   }),
  ideal: v.optional(v.any()),
  //   interac_present: optionalnullableobject({
  //     // TODO: complete
  //   }),
  interac_present: v.optional(v.any()),
  //   kakao_pay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  kakao_pay: v.optional(v.any()),
  //   klarna: optionalnullableobject({
  //     // TODO: complete
  //   }),
  klarna: v.optional(v.any()),
  //   konbini: optionalnullableobject({
  //     // TODO: complete
  //   }),
  konbini: v.optional(v.any()),
  //   kr_card: optionalnullableobject({
  //     // TODO: complete
  //   }),
  kr_card: v.optional(v.any()),
  //   link: optionalnullableobject({
  //     // TODO: complete
  //   }),
  link: v.optional(v.any()),
  livemode: v.boolean(),
  //   mobilepay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  mobilepay: v.optional(v.any()),
  //   multibanco: optionalnullableobject({
  //     // TODO: complete
  //   }),
  multibanco: v.optional(v.any()),
  //   naver_pay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  naver_pay: v.optional(v.any()),
  //   nz_bank_account: optionalnullableobject({
  //     // TODO: complete
  //   }),
  nz_bank_account: v.optional(v.any()),
  //   oxxo: optionalnullableobject({
  //     // TODO: complete
  //   }),
  oxxo: v.optional(v.any()),
  //   p24: optionalnullableobject({
  //     // TODO: complete
  //   }),
  p24: v.optional(v.any()),
  //   pay_by_bank: optionalnullableobject({
  //     // TODO: complete
  //   }),
  pay_by_bank: v.optional(v.any()),
  //   payco: optionalnullableobject({
  //     // TODO: complete
  //   }),
  payco: v.optional(v.any()),
  //   paynow: optionalnullableobject({
  //     // TODO: complete
  //   }),
  paynow: v.optional(v.any()),
  //   paypal: optionalnullableobject({
  //     // TODO: complete
  //   }),
  paypal: v.optional(v.any()),
  //   pix: optionalnullableobject({
  //     // TODO: complete
  //   }),
  pix: v.optional(v.any()),
  //   promptpay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  promptpay: v.optional(v.any()),
  //   radar_options: optionalnullableobject({
  //     // TODO: complete
  //   }),
  radar_options: v.optional(v.any()),
  //   revolut_pay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  revolut_pay: v.optional(v.any()),
  //   samsung_pay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  samsung_pay: v.optional(v.any()),
  //   satispay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  satispay: v.optional(v.any()),
  //   sepa_debit: optionalnullableobject({
  //     // TODO: complete
  //   }),
  sepa_debit: v.optional(v.any()),
  //   sofort: optionalnullableobject({
  //     // TODO: complete
  //   }),
  sofort: v.optional(v.any()),
  //   swish: optionalnullableobject({
  //     // TODO: complete
  //   }),
  swish: v.optional(v.any()),
  //   twint: optionalnullableobject({
  //     // TODO: complete
  //   }),
  twint: v.optional(v.any()),
  //   us_bank_account: optionalnullableobject({
  //     // TODO: complete
  //   }),
  us_bank_account: v.optional(v.any()),
  //   wechat_pay: optionalnullableobject({
  //     // TODO: complete
  //   }),
  wechat_pay: v.optional(v.any()),
  //   zip: optionalnullableobject({
  //     // TODO: complete
  //   }),
  zip: v.optional(v.any()),
};

export const PaymentMethodObject = v.object(PaymentMethodSchema);
