import React, { useRef, useState } from "react";
import { Image as ImageIcon, FileText } from "lucide-react";
import ImagePreview from "./ImagePreview";
import FilePreview from "./FilePreview";

const AttachmentMenu = ({ onClose, onSendPayload }) => {
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [previewData, setPreviewData] = useState(null); // { type: 'image'|'file', file: File }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewData({ type, file });
    }
  };

  const handleSend = async () => {
    const formData = new FormData();
    formData.append("file", previewData.file);

    try {
       const res = await fetch("http://localhost:5000/api/messages/upload", {
          method: "POST",
          body: formData
       });
       const data = await res.json();
       onSendPayload({
          messageType: previewData.type,
          fileUrl: `http://localhost:5000/uploads/${data.fileUrl}`, // Ensure correct path routing
          fileName: data.fileName
       });
    } catch (err) {
       console.error(err);
    }
  };

  if (previewData) {
     return previewData.type === "image" ? (
        <ImagePreview file={previewData.file} onCancel={() => setPreviewData(null)} onSend={handleSend} />
     ) : (
        <FilePreview file={previewData.file} onCancel={() => setPreviewData(null)} onSend={handleSend} />
     );
  }

  return (
    <>
      <div className="attach-menu" style={{ position: "absolute", bottom: "60px", left: "10px", background: "#202c33", borderRadius: "10px", padding: "10px", width: "150px", boxShadow: "0 2px 10px rgba(0,0,0,0.5)", zIndex: 100 }}>
        <p onClick={() => fileInputRef.current.click()} style={{ padding: "8px", margin: 0, cursor: "pointer", color: "#e9edef", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#2a3942"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
           <FileText size={18} /> File
        </p>
        <p onClick={() => imageInputRef.current.click()} style={{ padding: "8px", margin: 0, cursor: "pointer", color: "#e9edef", display: "flex", alignItems: "center", gap: "10px", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#2a3942"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
           <ImageIcon size={18} /> Image
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "file")}
      />

      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: "none" }}
        onChange={(e) => handleFileChange(e, "image")}
      />
      <div 
         onClick={onClose} 
         style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 90 }} 
      />
    </>
  );
};

export default AttachmentMenu;
