"use client";

import React from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface StatusBarProps {
  currentView: "board" | "storage";
  setView: (view: "board" | "storage") => void;
}

export default function StatusBar({ currentView, setView }: StatusBarProps) {
  const { connected, account, disconnect, connect, wallets } = useWallet();

  const handleConnect = async () => {
    // Automatically selects the first available injector (e.g., Petra, Pontem)
    if (wallets && wallets.length > 0) {
      try {
        await connect(wallets[0].name);
      } catch (err) {
        console.warn("Connection cancelled or failed.");
      }
    } else {
      alert("No Aptos wallet detected! Please install Petra Wallet.");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header wrapper">
      <div className="header-left">
        <div 
          style={{
            height: "36px",
            width: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--teal-400), var(--purple-600))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            color: "#07090E"
          }}
        >
          S²
        </div>
        <div>
          <h1 className="app-title">ShelterSync</h1>
        </div>
        <span className="badge badge-purple">Sprint 3</span>
        <span className="badge badge-teal">Shelby Storage</span>
      </div>

      <div className="nav">
        <button 
          className={`nav-btn ${currentView === "board" ? "active" : ""}`}
          onClick={() => setView("board")}
        >
          Task Board
        </button>
        <button 
          className={`nav-btn ${currentView === "storage" ? "active" : ""}`}
          onClick={() => setView("storage")}
        >
          Shelby Storage
        </button>
      </div>

      <div className={`shelby-bar ${connected ? "connected" : ""}`} style={{ width: "100%", marginTop: "12px" }}>
        <div className="shelby-bar-left">
          <span className={`dot ${connected ? "on" : "off"}`} />
          <div>
            <div className="bar-title">
              {connected ? "Shelby Protocol — Connected to Testnet" : "Shelby Protocol — Not connected"}
            </div>
            <div className="bar-sub">
              {connected 
                ? "Aptos Testnet · 16 storage providers · 33 files stored" 
                : "Connect your Aptos wallet to access decentralized storage"}
            </div>
          </div>
        </div>

        <div className="bar-right">
          {connected && account ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="wallet-chip">{formatAddress(account.address)}</span>
              <button className="btn btn-danger" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn-connect" onClick={handleConnect}>
              Connect Aptos Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}