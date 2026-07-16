export const PAYMENT_METHODS = [
  { value: "CARD", label: "카드" },
  { value: "TRANSFER", label: "계좌이체" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

interface PaymentReadiness {
  hasPaymentInstance: boolean;
  price: number | null;
  selectedMethod: PaymentMethod | null;
  hasAgreedToTerms: boolean;
  hasProductError: boolean;
}

export const canRequestPayment = ({
  hasPaymentInstance,
  price,
  selectedMethod,
  hasAgreedToTerms,
  hasProductError,
}: PaymentReadiness) =>
  hasPaymentInstance &&
  price !== null &&
  selectedMethod !== null &&
  hasAgreedToTerms &&
  !hasProductError;
