"use client";

import { useEffect } from "react";
import { useShelby } from "@/providers/ShelbyProvider";
import { ShelbyFile } from "@/lib/shelby";

export default function StoragePanel() {
  const { files, fetchFiles, download, isConnected } = useShelby();

  useEffect(() => {
    if (isConnected) fetchFiles();
  }, [isConnected, fetchFiles]);

  const fmtBytes = (n: number) => {
    if (!n) return "—";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
  };

  const fmtDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short" })
      : "—";

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-title">Shelby Storage</h2>
          <p className="panel-sub">
            Task attachments stored decentrally on Aptos blockchain via Shelby Protocol
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="count-chip">{files.length} file{files.length !== 1 ? "s" : ""}</span>
          {isConnected && (
            <button className="btn btn-ghost" onClick={fetchFiles}>Refresh</button>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="steps-row">
        {["Erasure coding", "On-chain registration", "Upload to 16 providers"].map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span className="arrow">→</span>}
            <div className="step-item">
              <span className="step-num">{i + 1}</span>
              <span className="step-text">{s}</span>
            </div>
          </div>
        ))}
      </div>

      {!isConnected ? (
        <div className="empty">Connect your Aptos wallet to view your files on Shelby.</div>
      ) : files.length === 0 ? (
        <div className="empty">No files yet. Attach files to tasks from the Task Board.</div>
      ) : (
        <div className="file-table">
          <div className="file-table-head">
            <span>File</span>
            <span>Task</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span>Blob ID</span>
            <span></span>
          </div>
          {files.map((f) => (
            <FileRow key={f.id} file={f} onDownload={() => download(f)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file, onDownload }: { file: ShelbyFile; onDownload: () => void }) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const COLOR: Record<string, string> = {
    pdf: "#E24B4A", xlsx: "#3B6D11", xls: "#3B6D11",
    png: "#185FA5", jpg: "#185FA5", jpeg: "#185FA5",
    doc: "#185FA5", docx: "#185FA5",
  };
  const color = COLOR[ext] ?? "#534AB7";

  const fmtBytes = (n: number) => {
    if (!n) return "—";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(1) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
  };

  const fmtDate = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", { day: "2-digit", month: "short" })
      : "—";

  return (
    <div className="file-row">
      <div className="file-name-cell">
        <div className="file-icon" style={{ background: color + "22", color }}>
          {ext.toUpperCase().slice(0, 3)}
        </div>
        <span className="file-name">{file.name}</span>
      </div>
      <span className="file-task">{file.name || "—"}</span>
      <span className="file-size">{fmtBytes(file.size)}</span>
      <span className="file-date">{fmtDate(file.uploadedAt)}</span>
      <span className="blob-id" title={file.id}>
        {file.id ? file.id.slice(0, 10) + "..." : "—"}
      </span>
      <button className="btn-dl" onClick={onDownload}>Download</button>
    </div>
  );
}
