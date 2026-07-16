export type PaymentDeliveryStatus = "SENT" | "PENDING" | "FAILED" | "UNKNOWN";

export const resolvePaymentDeliveryStatus = (
  deliveryStatus: unknown,
): PaymentDeliveryStatus => {
  if (
    deliveryStatus === "SENT" ||
    deliveryStatus === "PENDING" ||
    deliveryStatus === "FAILED"
  ) {
    return deliveryStatus;
  }

  return "UNKNOWN";
};

export const PAYMENT_DELIVERY_MESSAGES: Record<PaymentDeliveryStatus, string> = {
  SENT: "결제가 완료되었으며 이메일 발송도 완료되었습니다.",
  PENDING: "결제는 완료되었습니다. 자료 발송을 준비하고 있습니다.",
  FAILED:
    "결제는 완료되었으나 이메일 발송에 실패했습니다. 고객센터에 문의해 주세요.",
  UNKNOWN: "결제는 완료되었습니다. 발송 상태를 확인 중입니다.",
};

export const isPaymentConfirmationSuccessful = (
  httpStatus: number,
  isSuccess: unknown,
) => httpStatus === 200 || httpStatus === 201 || isSuccess === true;
