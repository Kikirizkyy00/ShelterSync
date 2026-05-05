"use client";

import { useState, useRef, useEffect } from "react";
import { useShelby } from "@/providers/ShelbyProvider";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const STEPS = [
  "Encoding file with erasure coding",
  "Registering on Aptos blockchain",
  "Uploading to Shelby storage providers",
  "Complete!",
];

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadModal({
  id,
  name,
  onClose,
}: {
  id: string;
  name: string;
  onClose: () => void;
}) {
  const { upload, uploading, progress, setUploadProgress } = useShelby();
  const { connected } = useWallet();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [localUploading, setLocalUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (connected && error === "Please connect your Aptos wallet first.") {
      setError("");
    }
  }, [connected, error]);

  const handleUpload = async () => {
    if (!connected) { setError("Please connect your Aptos wallet first."); return; }
    if (!file) { setError("Please select a file first."); return; }
    setError("");
    setLocalUploading(true);
    try {
      await upload(file, (step, label) => {
        setUploadProgress({ step, label });
      });
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setLocalUploading(false);
    }
  };

  const isUploading = uploading || localUploading;
  const pct = progress ? Math.round((progress.step / 4) * 100) : 0;

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && !isUploading && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="modal-title">Attach file to Shelby</h2>
          <button className="modal-close" onClick={onClose} disabled={isUploading}>✕</button>
        </div>

        <div className="info-box">
          <p>Files are stored on the <strong>Shelby Protocol</strong> — decentralized storage on Aptos blockchain.</p>
          <p style={{ marginTop: 4 }}>Cost: <strong>1 ShelbyUSD</strong> per file · Retention: 30 days · Max: <strong>{MAX_SIZE_MB} MB</strong></p>
        </div>

        <div className="form-group">
          <label className="label">Related task</label>
          <div className="task-chip">{name}</div>
        </div>

        <div className="form-group">
          <label className="label">Select file</label>
          <div className="dropzone" onClick={() => !isUploading && inputRef.current?.click()}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto", display: "block" }}>
              <path d="M12 15V4m0 0l-4 4m4-4l4 4" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="drop-label">
              {file ? file.name : "Click to select a file (PDF, XLSX, PNG, MP4, etc.)"}
            </p>
            {file && (
              <p className="drop-size" style={{ color: file.size > MAX_SIZE_BYTES ? "#ff4444" : undefined }}>
                {formatSize(file.size)} {file.size > MAX_SIZE_BYTES ? `— exceeds ${MAX_SIZE_MB} MB limit` : ""}
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setError("");
            }}
          />
        </div>

        {isUploading && progress && (
          <div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%`, transition: "width 0.4s ease" }} />
            </div>
            <p className="progress-label">{progress.label}</p>
            {file && progress.step === 3 && (
              <p style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>
                Uploading {formatSize(file.size)} — large files may take several minutes...
              </p>
            )}
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

        {error && (
          <div className="error" style={{ color: "#ff4444", fontSize: "0.9rem", marginTop: "1rem" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success" style={{ color: "#44ff44", fontSize: "0.9rem", marginTop: "1rem" }}>
            File uploaded successfully!
          </div>
        )}

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={isUploading}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || isUploading || file.size > MAX_SIZE_BYTES}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}