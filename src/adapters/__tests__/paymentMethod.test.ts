/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import {
  canRequestPayment,
  PAYMENT_METHODS,
} from "../../contracts/paymentMethod.ts";

test("individual payment supports CARD and TRANSFER methods", () => {
  assert.deepEqual(
    PAYMENT_METHODS.map(({ value }) => value),
    ["CARD", "TRANSFER"],
  );
});

test("payment remains disabled until required terms are accepted", () => {
  const readiness = {
    hasPaymentInstance: true,
    price: 10000,
    selectedMethod: "CARD" as const,
    hasProductError: false,
  };

  assert.equal(
    canRequestPayment({ ...readiness, hasAgreedToTerms: false }),
    false,
  );
  assert.equal(
    canRequestPayment({ ...readiness, hasAgreedToTerms: true }),
    true,
  );
});

test("each supported method can become payment-ready", () => {
  for (const { value } of PAYMENT_METHODS) {
    assert.equal(
      canRequestPayment({
        hasPaymentInstance: true,
        price: 10000,
        selectedMethod: value,
        hasAgreedToTerms: true,
        hasProductError: false,
      }),
      true,
    );
  }
});
