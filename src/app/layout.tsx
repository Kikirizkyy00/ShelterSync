import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";
import { ShelbyProvider } from "@/providers/ShelbyProvider";
import { GlobalErrorHandler } from "@/components/GlobalErrorHandler";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShelterSync",
  description:
    "Team task management app with decentralized file storage powered by Shelby Protocol on Aptos blockchain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        {/*
          GlobalErrorHandler intercepts unhandledRejection events BEFORE
          the Petra / MetaMask wallet extension can catch them and crash
          with "Cannot use 'in' operator to search for 'status' in undefined".
        */}
        <GlobalErrorHandler />
        <WalletProvider>
          <ShelbyProvider>{children}</ShelbyProvider>
        </WalletProvider>
      </body>
    </html>
  );
}