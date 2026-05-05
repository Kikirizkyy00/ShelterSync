"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      onError={(error) => {
        console.error("[WalletProvider] Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
