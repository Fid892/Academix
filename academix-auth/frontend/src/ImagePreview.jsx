import React, { useState, useEffect } from "react";
import { Send, X, Loader } from "lucide-react";

const ImagePreview = ({ file, onCancel, onSend }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSend = async () => {
    setIsSending(true);
    await onSend();
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onCancel} disabled={isSending} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          <X size={28} />
        </button>
        <div style={{ color: "#fff", fontWeight: "600", fontSize: "1.1rem" }}>Preview Image</div>
        <div style={{ width: "28px" }} />
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden", padding: "20px" }}>
        {previewUrl && (
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "12px" }} />
        )}
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

export default ImagePreview;
