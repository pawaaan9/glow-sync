"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ZoomIn } from "lucide-react";
import { useRef, useState } from "react";

const VIEWPORT_SIZE = 280;
const OUTPUT_SIZE = 512;

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropped: (file: File) => void;
  fileName?: string;
  title?: string;
}

export function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropped,
  fileName = "logo.jpg",
  title = "Adjust your photo",
}: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origin: { x: number; y: number } } | null>(
    null,
  );

  const baseScale =
    naturalSize.width > 0
      ? Math.max(VIEWPORT_SIZE / naturalSize.width, VIEWPORT_SIZE / naturalSize.height)
      : 0;
  const effectiveScale = baseScale * zoom;
  const displayWidth = naturalSize.width * effectiveScale;
  const displayHeight = naturalSize.height * effectiveScale;

  function clampOffset(x: number, y: number, width: number, height: number) {
    const minX = Math.min(0, VIEWPORT_SIZE - width);
    const minY = Math.min(0, VIEWPORT_SIZE - height);
    return {
      x: Math.min(0, Math.max(minX, x)),
      y: Math.min(0, Math.max(minY, y)),
    };
  }

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    setNaturalSize({ width, height });
    const scale = Math.max(VIEWPORT_SIZE / width, VIEWPORT_SIZE / height);
    setOffset(clampOffset((VIEWPORT_SIZE - width * scale) / 2, (VIEWPORT_SIZE - height * scale) / 2, width * scale, height * scale));
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(
      clampOffset(dragRef.current.origin.x + dx, dragRef.current.origin.y + dy, displayWidth, displayHeight),
    );
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }

  function handleZoomChange(nextZoom: number) {
    setZoom(nextZoom);
    const nextScale = baseScale * nextZoom;
    const nextWidth = naturalSize.width * nextScale;
    const nextHeight = naturalSize.height * nextScale;
    setOffset((prev) => clampOffset(prev.x, prev.y, nextWidth, nextHeight));
  }

  function handleSave() {
    const img = imgRef.current;
    if (!img || effectiveScale === 0) return;

    const sourceSize = VIEWPORT_SIZE / effectiveScale;
    const sourceX = -offset.x / effectiveScale;
    const sourceY = -offset.y / effectiveScale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCropped(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="flex flex-col items-center gap-5">
        <div
          className="relative touch-none select-none overflow-hidden rounded-full bg-neutral-100"
          style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- transient blob/data URL, cropped client-side before upload
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Photo to crop"
              draggable={false}
              onLoad={handleImageLoad}
              className="pointer-events-none absolute left-0 top-0 max-w-none cursor-grab"
              style={{
                width: displayWidth || undefined,
                height: displayHeight || undefined,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/10" />
        </div>

        <div className="flex w-full items-center gap-3">
          <ZoomIn className="size-4 shrink-0 text-neutral-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full accent-rose-500"
          />
        </div>

        <p className="text-center text-xs text-neutral-500">Drag to reposition, use the slider to zoom.</p>

        <div className="flex w-full gap-3">
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" fullWidth onClick={handleSave}>
            Save photo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
