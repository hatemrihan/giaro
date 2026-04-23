"use client";

import React from "react";
import Image from "next/image";
import { X, Film } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/Fileupload";

// ─── Types ────────────────────────────────────────────────────

interface MediaManagerProps {
    mainImage: string;
    images: string[];
    videos: string[];
    onMainImageChange: (url: string) => void;
    onImagesChange: (images: string[]) => void;
    onVideosChange: (videos: string[]) => void;
    onUploadError?: (msg: string) => void;
    error?: string;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Manages product media (images + videos) for the product form.
 *
 * Uses shadcn Button, Badge, Card, Label.
 * Styled for the admin dark (stone-900) theme.
 *
 * Note: The FileUpload component is currently a placeholder.
 * Media URLs can be entered manually or pasted.
 */
export const MediaManager: React.FC<MediaManagerProps> = ({
    mainImage,
    images,
    videos,
    onMainImageChange,
    onImagesChange,
    onVideosChange,
    onUploadError,
    error,
}) => {
    const totalMedia = (mainImage ? 1 : 0) + images.length + videos.length;

    const handleUpload = (url: string, isVideo = false) => {
        if (!mainImage && !isVideo) {
            onMainImageChange(url);
        } else if (isVideo) {
            onVideosChange([...videos, url]);
        } else {
            onImagesChange([...images, url]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-white text-sm font-medium">
                    Product Media
                </Label>
                {totalMedia > 0 && (
                    <Badge
                        variant="secondary"
                        className="bg-stone-800 text-stone-300 border-stone-700 text-xs"
                    >
                        {totalMedia} file{totalMedia !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* Upload zone */}
            <FileUpload 
                onUpload={handleUpload}
                onError={onUploadError}
                accept="image/*,video/*"
            />

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {/* Media grid */}
            {totalMedia > 0 && (
                <div className="space-y-2">
                    <Label className="text-xs text-stone-400">
                        Uploaded Media
                    </Label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                        {/* Main image */}
                        {mainImage && (
                            <div className="relative group rounded-lg overflow-hidden border border-stone-700">
                                <Image
                                    src={mainImage}
                                    alt="Main product image"
                                    width={120}
                                    height={80}
                                    className="w-full h-20 object-cover"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => onMainImageChange("")}
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <Badge className="absolute bottom-1 left-1 bg-white/90 text-stone-900 text-[10px] px-1.5 py-0 h-4">
                                    Main
                                </Badge>
                            </div>
                        )}

                        {/* Additional images */}
                        {images.map((img, index) => (
                            <div
                                key={`img-${index}`}
                                className="relative group rounded-lg overflow-hidden border border-stone-700"
                            >
                                <Image
                                    src={img}
                                    alt={`Product image ${index + 1}`}
                                    width={120}
                                    height={80}
                                    className="w-full h-20 object-cover"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                        onImagesChange(
                                            images.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}

                        {/* Videos */}
                        {videos.map((vid, index) => (
                            <div
                                key={`vid-${index}`}
                                className="relative group rounded-lg overflow-hidden border border-stone-700"
                            >
                                <video
                                    src={vid}
                                    className="w-full h-20 object-cover"
                                    muted
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                        onVideosChange(
                                            videos.filter((_, i) => i !== index),
                                        )
                                    }
                                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                                <Badge className="absolute bottom-1 left-1 bg-white/90 text-stone-900 text-[10px] px-1.5 py-0 h-4">
                                    <Film className="h-2.5 w-2.5 mr-0.5" />
                                    Video
                                </Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {totalMedia === 0 && (
                <p className="text-xs text-stone-500">
                    No media uploaded yet. The first image will automatically become the main product image.
                </p>
            )}
        </div>
    );
};
