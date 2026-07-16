/// <reference types="node" />

import assert from "node:assert/strict";
import test from "node:test";
import {
  isPaymentConfirmationSuccessful,
  PAYMENT_DELIVERY_MESSAGES,
  resolvePaymentDeliveryStatus,
} from "../paymentDeliveryStatus.ts";

const expectedMessages = {
  SENT: "결제가 완료되었으며 이메일 발송도 완료되었습니다.",
  PENDING: "결제는 완료되었습니다. 자료 발송을 준비하고 있습니다.",
  FAILED:
    "결제는 완료되었으나 이메일 발송에 실패했습니다. 고객센터에 문의해 주세요.",
  UNKNOWN: "결제는 완료되었습니다. 발송 상태를 확인 중입니다.",
} as const;

for (const [status, expectedMessage] of Object.entries(expectedMessages)) {
  test(`deliveryStatus ${status} renders its safe message`, () => {
    const resolvedStatus = resolvePaymentDeliveryStatus(
      status === "UNKNOWN" ? "UNRECOGNIZED_STATUS" : status,
    );

    assert.equal(PAYMENT_DELIVERY_MESSAGES[resolvedStatus], expectedMessage);
  });
}

test("successful payment with FAILED delivery remains a payment success", () => {
  assert.equal(isPaymentConfirmationSuccessful(200, true), true);
  assert.equal(resolvePaymentDeliveryStatus("FAILED"), "FAILED");
  assert.match(PAYMENT_DELIVERY_MESSAGES.FAILED, /^결제는 완료되었으나/);
});
