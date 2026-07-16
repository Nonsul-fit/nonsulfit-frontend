/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import {
  createLoginRedirectPath,
  getSafePostLoginPath,
} from "../../utils/authRedirect.ts";

test("unauthenticated payment access preserves the requested path", () => {
  assert.equal(
    createLoginRedirectPath("/payment"),
    "/login?redirect=%2Fpayment",
  );
  assert.equal(
    createLoginRedirectPath("/payment/success?orderId=order-1&amount=10000"),
    "/login?redirect=%2Fpayment%2Fsuccess%3ForderId%3Dorder-1%26amount%3D10000",
  );
});

test("login returns to the preserved internal payment path", () => {
  assert.equal(getSafePostLoginPath("/payment"), "/payment");
  assert.equal(
    getSafePostLoginPath("/payment/success?orderId=order-1"),
    "/payment/success?orderId=order-1",
  );
});

test("unsafe or missing redirect values fall back to home", () => {
  assert.equal(getSafePostLoginPath(null), "/home");
  assert.equal(getSafePostLoginPath("https://example.com"), "/home");
  assert.equal(getSafePostLoginPath("//example.com"), "/home");
});
