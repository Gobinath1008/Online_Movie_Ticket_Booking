"use client";
import { useState } from "react";

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadedUrl(result.imageUrl);
        alert("Image uploaded successfully!");
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Movie Poster</h1>
      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          required 
        />
        <button 
          type="submit" 
          disabled={!file || uploading}
          className="bg-blue-500 text-white py-2 px-4 rounded w-fit disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {uploadedUrl && (
        <div className="mt-8">
          <p>Uploaded Image Preview:</p>
          <img src={uploadedUrl} alt="Uploaded" className="mt-2 w-64 rounded shadow-md" />
        </div>
      )}
    </div>
  );
}