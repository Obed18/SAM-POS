// src/services/paystack.ts

type PaystackProps = {
  email: string;
  amount: number; // in main currency (e.g. GHS 50)
  onClose?: () => void;
};

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackPop = {
  setup: (options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    metadata?: any;
    callback: (response: PaystackResponse) => void;
    onClose?: () => void;
  }) => PaystackHandler;
};

type PaystackResponse = {
  reference: string;
  status: "success" | "failed";
};

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

export const payWithPaystack = ({
  email,
  amount,
  onClose,
}: PaystackProps): Promise<string> => {
  return new Promise((resolve, reject) => {
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    if (!paystackKey) {
      console.error("Paystack key is missing");
      reject(new Error("Paystack key is missing"));
      return;
    }

    if (!window.PaystackPop) {
      console.error("Paystack script not loaded");
      reject(new Error("Paystack script not loaded"));
      return;
    }

    const amountInPesewas = Math.max(0, Math.round(amount * 100));

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email,
      amount: amountInPesewas,
      currency: "GHS",
      metadata: {
        custom_fields: [
          {
            display_name: "Paid via POS",
            variable_name: "pos_payment",
            value: "POS Transaction",
          },
        ],
      },
      callback: (response: PaystackResponse) => {
        if (response.status === "success") {
          resolve(response.reference);
        } else {
          reject(new Error("Payment failed"));
        }
      },
      onClose: () => {
        onClose?.();
        reject(new Error("Payment cancelled"));
      },
    });

    handler.openIframe();
  });
};