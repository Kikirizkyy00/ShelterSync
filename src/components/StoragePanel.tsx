"use client";

import { useEffect } from "react";
import { useShelby } from "@/providers/ShelbyProvider";
import { ShelbyFile } from "@/lib/shelby";

export default function StoragePanel() {
  const { files, fetchFiles, download, isConnected } = useShelby();

  useEffect(() => {
    if (isConnected) fetchFiles();
  }, [isConnected, fetchFiles]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2 className="panel-title text-xl font-bold">Shelby Storage</h2>
          <p className="panel-sub text-sm text-gray-400">
            Task attachments stored decentrally on Aptos blockchain via Shelby Protocol
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="count-chip bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
          {isConnected && (
            <button className="btn btn-ghost text-xs hover:underline" onClick={fetchFiles}>
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="steps-row flex gap-4 my-6 overflow-x-auto pb-2">
        {["Erasure coding", "On-chain registration", "Upload to 16 providers"].map(
          (s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <span className="arrow text-gray-600">→</span>}
              <div className="step-item flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <span className="step-num bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{i + 1}</span>
                <span className="step-text text-xs text-gray-300">{s}</span>
              </div>
            </div>
          )
        )}
      </div>

      {!isConnected ? (
        <div className="empty py-10 text-center text-gray-500 italic">
          Connect your Aptos wallet to view your files on Shelby.
        </div>
      ) : files.length === 0 ? (
        <div className="empty py-10 text-center text-gray-500 italic">
          No files yet. Attach files to tasks from the Task Board.
        </div>
      ) : (
        <div className="file-table w-full">
          <div className="file-table-head grid grid-cols-5 text-[10px] uppercase text-gray-500 border-b border-white/5 pb-2 mb-2 px-2">
            <span>File</span>
            <span>Size</span>
            <span>Uploaded</span>
            <span>Blob ID</span>
            <span></span>
          </div>

          {files.map((f) => (
            <FileRow
              key={f.id}
              file={f}
              onDownload={() => download(f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileRow({ file, onDownload }: { file: ShelbyFile; onDownload: () => void; }) {
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
    return (n / 1024).toFixed(1) + " KB";
  };

  const fmtDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString("en-US", { day: "2-digit", month: "short" }) : "—";

  return (
    <div className="file-row grid grid-cols-5 items-center py-3 px-2 hover:bg-white/5 rounded-lg transition-colors border-b border-white/5">
      <div className="file-name-cell flex items-center gap-3">
        <div className="file-icon w-8 h-8 flex items-center justify-center rounded text-[10px] font-bold" style={{ background: color + "22", color }}>
          {ext.toUpperCase().slice(0, 3)}
        </div>
        <span className="file-name text-sm font-medium truncate w-32" title={file.name}>{file.name}</span>
      </div>
      <span className="file-size text-xs text-gray-400">{fmtBytes(file.size)}</span>
      <span className="file-date text-xs text-gray-400">{fmtDate(file.uploadedAt)}</span>
      <span className="blob-id text-[10px] font-mono text-gray-500" title={file.id}>
        {file.id ? file.id.slice(0, 10) + "..." : "—"}
      </span>
      <button className="btn-dl text-xs text-blue-500 hover:text-blue-400 font-bold text-right" onClick={onDownload}>
        Download
      </button>
    </div>
  );
}