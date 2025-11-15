/// <reference types="vite/client" />

declare global {
  interface Window {
    Razorpay: {
      new (options: any): {
        open: () => void;
        on: (event: string, callback: (response: any) => void) => void;
      };
    };
  }
}

export {};
