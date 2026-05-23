"use client";

import { useEffect } from "react";
import { useShelby } from "@/providers/ShelbyProvider";
import type { ShelbyFile } from "@/lib/types";

export default function StoragePanel() {
  const { files, refreshFiles, isLoadingFiles, upload, isReady } = useShelby();
  const isConnected = isReady;

  useEffect(() => {
    if (isConnected) {
      refreshFiles();
    }
  }, [isConnected, refreshFiles]);

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
          <span className="count-chip">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>

          {isConnected && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: "12px", padding: "4px 8px" }}
              onClick={refreshFiles}
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="steps-row">
        {[
          "Erasure coding",
          "On-chain registration",
          "Upload to 16 providers",
        ].map((step, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            {i > 0 && <span className="arrow">→</span>}

            <div className="step-item">
              <span className="step-num">
                {i + 1}
              </span>
              <span className="step-text">
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!isConnected ? (
        <div className="empty">
          Connect your Aptos wallet to view your files on Shelby.
        </div>
      ) : files.length === 0 ? (
        <div className="empty">
          No files yet. Attach files to tasks from the Task Board.
        </div>
      ) : (
        <div className="file-table">
          <div className="file-table-head">
            <span>File</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span>Blob ID</span>
            <span></span>
          </div>

          {/* FIX: Handled non-unique contract array strings using index interpolation */}
          {files.map((file, index) => (
            <FileRow
              key={`${file.id}-${index}`}
              file={file}
              onDownload={() => window.open(file.url, "_blank")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({
  file,
  onDownload,
}: {
  file: ShelbyFile;
  onDownload: () => void;
}) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

  const COLOR: Record<string, string> = {
    pdf: "#E24B4A",
    xlsx: "#3B6D11",
    xls: "#3B6D11",
    png: "#00E5FF", // Cyan Web3 color match
    jpg: "#185FA5",
    jpeg: "#185FA5",
    doc: "#7F77DD", // Purple Web3 color match
    docx: "#7F77DD",
  };

  const color = COLOR[ext] ?? "#534AB7";

  const fmtBytes = (n: number) => {
    if (!n) return "—";
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1048576).toFixed(1)} MB`; // Added MB precision for larger files
  };

  const fmtDate = (ts: number) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="file-row">
      <div className="file-name-cell">
        <div
          className="file-icon"
          style={{
            background: `${color}22`,
            color,
          }}
        >
          {ext.toUpperCase().slice(0, 3)}
        </div>

        <span
          className="file-name"
          title={file.name}
        >
          {file.name}
        </span>
      </div>

      <span className="file-size">
        {fmtBytes(file.size)}
      </span>

      <span className="file-date">
        {fmtDate(new Date(file.uploadedAt).getTime())}
      </span>

      <span
        className="blob-id"
        title={file.id}
      >
        {file.id ? `${file.id.slice(0, 8)}...${file.id.slice(-4)}` : "—"}
      </span>

      <div style={{ textAlign: "right" }}>
        <button
          className="btn-dl"
          onClick={onDownload}
        >
          Download
        </button>
      </div>
    </div>
  );
}