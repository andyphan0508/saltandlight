"use client";

import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check, Undo2 } from "./Icons";
import { Button } from "@saltandlight/ui";

interface BannerCropModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
}

const BANNER_ASPECT_RATIO = 16 / 7; // ~ 2.285 (Standard Hero Banner Widescreen)
const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / BANNER_ASPECT_RATIO); // ~ 840px

export function BannerCropModal({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
}: BannerCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageSrc(url);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageSrc(null);
    }
  }, [imageFile]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile admin users
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      setIsDragging(true);
      dragStartRef.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (touch) {
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleApplyCrop = async () => {
    if (!imgRef.current || !containerRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imgRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // Fill background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // Scaling factor between preview box and canvas output
    const factor = OUTPUT_WIDTH / containerRect.width;

    ctx.save();
    // Center point of canvas
    ctx.translate(OUTPUT_WIDTH / 2, OUTPUT_HEIGHT / 2);
    // Apply pan offset
    ctx.translate(position.x * factor, position.y * factor);
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    // Apply zoom scale
    ctx.scale(scale, scale);

    // Draw the image centered
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW: number;
    let drawH: number;

    // Default "cover" fit inside container
    if (imgAspect > BANNER_ASPECT_RATIO) {
      drawH = OUTPUT_HEIGHT;
      drawW = drawH * imgAspect;
    } else {
      drawW = OUTPUT_WIDTH;
      drawH = drawW / imgAspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Compress to WebP targeting ~250kb - 450kb
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const fileName = (imageFile?.name || "banner").replace(/\.[^/.]+$/, "") + "-cropped.webp";
        const file = new File([blob], fileName, { type: "image/webp" });
        onCropComplete(file);
      },
      "image/webp",
      0.85,
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-ink/10 flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <div>
            <h3 className="font-display font-black uppercase text-base text-ink">
              Chỉnh Sửa &amp; Căn Chỉnh Banner
            </h3>
            <p className="text-xs text-ink/60 mt-0.5">
              Kéo di chuyển và thu phóng ảnh để khung hình hiển thị chuẩn tỉ lệ banner (16:7)
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewport Stage */}
        <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center select-none overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/7] max-h-[400px] overflow-hidden rounded-2xl border-2 border-dashed border-emerald-400/80 shadow-2xl cursor-grab active:cursor-grabbing bg-slate-900 flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Aspect ratio label */}
            <div className="absolute top-2 left-2 z-20 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-mono text-emerald-300 pointer-events-none">
              Tỉ lệ banner: 16:7 (Chuẩn Widescreen)
            </div>

            {/* Draggable & Scalable Image */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Banner preview"
                className="max-w-none w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-ink/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <ZoomOut size={16} className="text-ink/60" />
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-ink/15 rounded-lg appearance-none cursor-pointer accent-brand-forest"
            />
            <ZoomIn size={16} className="text-ink/60" />
            <span className="text-xs font-mono text-ink/70 w-12 text-right">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRotate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ink/10 bg-white text-xs font-bold text-ink hover:bg-ink/5"
              title="Xoay 90 độ"
            >
              <RotateCw size={14} />
              <span>Xoay</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ink/10 bg-white text-xs font-bold text-ink hover:bg-ink/5"
              title="Đặt lại vị trí"
            >
              <Undo2 size={14} />
              <span>Đặt lại</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCrop}
              className="flex items-center gap-1.5 bg-brand-forest text-white"
            >
              <Check size={16} />
              <span>Cắt &amp; Lưu Ảnh Banner</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
