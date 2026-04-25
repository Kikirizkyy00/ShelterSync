"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useShelby } from "@/providers/ShelbyProvider";

export default function StatusBar() {
  const { connect, disconnect, connected, account, wallets } = useWallet();
  const { files } = useShelby();

  const handleConnect = () => {
    const petra = wallets?.find((w) => w.name === "Petra");
    if (petra) connect(petra.name);
  };

  const short = (addr?: string) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  return (
    <div className={`shelby-bar ${connected ? "connected" : ""}`}>
      <div className="shelby-bar-left">
        <span className={`dot ${connected ? "on" : "off"}`} />
        <div>
          <p className="bar-title">
            Shelby Protocol — {connected ? "Connected to Testnet" : "Not connected"}
          </p>
          <p className="bar-sub">
            {connected
              ? `Aptos Testnet · 16 storage providers · ${files.length} file${files.length !== 1 ? "s" : ""} stored`
              : "Connect your Aptos wallet to access decentralized storage"}
          </p>
        </div>
      </div>
      <div className="bar-right">
        {connected && account && (
          <span className="wallet-chip">{short(account.address.toString())}</span>
        )}
        {connected ? (
          <button className="btn btn-danger" onClick={disconnect}>Disconnect</button>
        ) : (
          <button className="btn-connect" onClick={handleConnect}>
            Connect Aptos Wallet
          </button>
        )}
      </div>
    </div>
  );
}
