"use client";

import { useState, useRef } from "react";
import { useShelby } from "@/providers/ShelbyProvider";

const STEPS = [
  "Encoding file with erasure coding",
  "Registering on Aptos blockchain",
  "Uploading to Shelby storage providers",
  "Complete!",
];

export default function UploadModal({
  taskId,
  taskTitle,
  onClose,
}: {
  taskId: number;
  taskTitle: string;
  onClose: () => void;
}) {
  const { upload, uploading, progress, isConnected } = useShelby();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!isConnected) { setError("Please connect your Aptos wallet first."); return; }
    if (!file) { setError("Please select a file first."); return; }
    setError("");
    try {
      await upload({ file, taskId, taskTitle });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    }
  };

  const pct = Math.round((progress.step / 4) * 100);

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && !uploading && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">Attach file to Shelby</h2>
          <button className="modal-close" onClick={onClose} disabled={uploading}>✕</button>
        </div>

        <div className="info-box">
          <p>Files are stored on the <strong>Shelby Protocol</strong> — decentralized storage on Aptos blockchain.</p>
          <p style={{ marginTop: 4 }}>Cost: <strong>1 ShelbyUSD</strong> per file · Retention: 30 days</p>
        </div>

        <div className="form-group">
          <label className="label">Related task</label>
          <div className="task-chip">{taskTitle}</div>
        </div>

        <div className="form-group">
          <label className="label">Select file</label>
          <div className="dropzone" onClick={() => inputRef.current?.click()}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto", display: "block" }}>
              <path d="M12 15V4m0 0l-4 4m4-4l4 4" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="drop-label">
              {file ? file.name : "Click to select a file (PDF, XLSX, PNG, etc.)"}
            </p>
            {file && <p className="drop-size">{(file.size / 1024).toFixed(1)} KB</p>}
          </div>
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => { setFile(e.target.files?.[0] || null); setError(""); }}
          />
        </div>

        {uploading && (
          <div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="progress-label">{progress.label}</p>
            <div className="steps">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`step-dot ${progress.step > i ? "done" : ""} ${progress.step === i + 1 ? "active" : ""}`}
                />
              ))}
            </div>
          </div>
        )}

        {success && <p className="msg-ok">File successfully stored on Shelby!</p>}
        {error && <p className="msg-err">{error}</p>}

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || !file || success}
          >
            {uploading ? "Uploading..." : "Upload to Shelby"}
          </button>
        </div>
      </div>
    </div>
  );
}
