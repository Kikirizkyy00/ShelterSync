import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";
import { ShelbyProvider } from "@/providers/ShelbyProvider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shelby Task Manager",
  description: "Team task management app with decentralized file storage powered by Shelby Protocol on Aptos blockchain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <WalletProvider>
          <ShelbyProvider>{children}</ShelbyProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
