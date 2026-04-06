import React, { useState } from "react";
import { Send, X, Loader, FileText } from "lucide-react";

const FilePreview = ({ file, onCancel, onSend }) => {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    await onSend();
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = 2, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onCancel} disabled={isSending} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          <X size={28} />
        </button>
        <div style={{ color: "#fff", fontWeight: "600", fontSize: "1.1rem" }}>Preview File</div>
        <div style={{ width: "28px" }} />
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", padding: "20px" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", padding: "40px", borderRadius: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
           <div style={{ background: "rgba(0,168,132,0.1)", padding: "20px", borderRadius: "50%", color: "#00a884" }}>
              <FileText size={64} />
           </div>
           <h3 style={{ margin: 0, color: "#fff", textAlign: "center", wordBreak: "break-all", maxWidth: "300px" }}>
              {file.name}
           </h3>
           <p style={{ margin: 0, color: "var(--text-dim)" }}>
              {formatSize(file.size)}
           </p>
        </div>
      </div>

      <div style={{ padding: "20px", display: "flex", justifyContent: "center", background: "#202c33" }}>
        <button 
           onClick={handleSend} 
           disabled={isSending}
           style={{ background: "#00a884", color: "#fff", border: "none", borderRadius: "50%", width: "56px", height: "56px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer" }}
        >
          {isSending ? <Loader size={24} className="spin" /> : <Send size={24} />}
        </button>
      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FilePreview;
