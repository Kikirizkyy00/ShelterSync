"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode } from "react";
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      // Properti ini mendeteksi Petra/Martian secara otomatis tanpa plugin tambahan
      optInApiExtensions={true}
      onError={(error) => {
        console.error("Aptos Wallet Error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}