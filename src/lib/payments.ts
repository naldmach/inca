// Manual settlement methods. There is no payment gateway here: the host
// publishes where to send money, the guest transfers and submits a reference,
// and the host confirms. Nothing in this file touches card data.

export type PaymentMethodId = "bank_transfer" | "gcash" | "paymaya";

export interface PaymentMethodField {
  key: string;
  label: string;
  placeholder: string;
}

export interface PaymentMethodSpec {
  id: PaymentMethodId;
  label: string;
  description: string;
  // What the host fills in when setting up their place
  fields: PaymentMethodField[];
  // What the guest is told to send
  referenceLabel: string;
}

export const PAYMENT_METHODS: PaymentMethodSpec[] = [
  {
    id: "bank_transfer",
    label: "Bank transfer",
    description: "Guests transfer to your bank account.",
    fields: [
      { key: "bank_name", label: "Bank name", placeholder: "BPI" },
      { key: "account_name", label: "Account name", placeholder: "Juan dela Cruz" },
      { key: "account_number", label: "Account number", placeholder: "1234 5678 90" },
    ],
    referenceLabel: "Transaction reference number",
  },
  {
    id: "gcash",
    label: "GCash",
    description: "Guests send to your GCash number.",
    fields: [
      { key: "account_name", label: "Registered name", placeholder: "Juan dela Cruz" },
      { key: "mobile_number", label: "GCash number", placeholder: "0917 123 4567" },
    ],
    referenceLabel: "GCash reference number",
  },
  {
    id: "paymaya",
    label: "PayMaya",
    description: "Guests send to your PayMaya account.",
    fields: [
      { key: "account_name", label: "Registered name", placeholder: "Juan dela Cruz" },
      { key: "mobile_number", label: "PayMaya number", placeholder: "0917 123 4567" },
    ],
    referenceLabel: "PayMaya reference number",
  },
];

// { gcash: { account_name: "...", mobile_number: "..." }, ... }
export type HostPaymentDetails = Partial<
  Record<PaymentMethodId, Record<string, string>>
>;

export function getMethodSpec(id: string): PaymentMethodSpec | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

// A method counts as offered only when every one of its fields is filled in,
// so a guest is never shown a half-configured payout destination.
export function enabledMethods(
  details: HostPaymentDetails | null | undefined
): PaymentMethodSpec[] {
  if (!details) return [];

  return PAYMENT_METHODS.filter((method) => {
    const values = details[method.id];
    if (!values) return false;
    return method.fields.every((field) => values[field.key]?.trim());
  });
}

export function countNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}
