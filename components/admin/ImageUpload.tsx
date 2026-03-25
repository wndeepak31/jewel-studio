"use client";

import { useState } from "react";

export default function ImageUpload({ onUploadComplete, currentImage }: any) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        // In a real scenario, we'd send to a server-side route that uploads to Cloudinary
        // since Cloudinary API secret shouldn't be on client.
        // For this demo/integration, I'll create a dummy upload API route later.
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                onUploadComplete(data.url);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {currentImage && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={currentImage} alt="Preview" className="w-full h-full object-contain" />
                </div>
            )}
            <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-gray-50 text-gray-900 border border-gray-200 px-6 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-all">
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
                {currentImage && (
                    <button
                        type="button"
                        onClick={() => onUploadComplete("")}
                        className="text-red-500 text-xs font-medium"
                    >
                        Remove
                    </button>
                )}
            </div>
        </div>
    );
}
