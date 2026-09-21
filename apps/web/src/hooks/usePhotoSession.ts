"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AVAILABLE_FILTERS,
  AVAILABLE_FRAMES,
  AVAILABLE_LAYOUTS,
  type Frame,
  type ImageFilter,
  type Layout,
} from "@photobooth/core";

export interface CapturedPhoto {
  blob: Blob;
  url: string;
}

export function usePhotoSession() {
  const [selectedFilter, setSelectedFilter] = useState<ImageFilter>(AVAILABLE_FILTERS[0]);
  const [selectedFrame, setSelectedFrame] = useState<Frame>(AVAILABLE_FRAMES[0]);
  const [selectedLayout, setSelectedLayout] = useState<Layout>(AVAILABLE_LAYOUTS[0]);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);

  const slotsRemaining = useMemo(
    () => selectedLayout.photoRegions.length - capturedPhotos.length,
    [selectedLayout, capturedPhotos.length],
  );

  const canCapture = slotsRemaining > 0;
  const isComplete = slotsRemaining === 0;

  const addPhoto = useCallback(
    (blob: Blob) => {
      if (capturedPhotos.length < selectedLayout.photoRegions.length) {
        const url = URL.createObjectURL(blob);
        setCapturedPhotos((prev) => [...prev, { blob, url }]);
      }
    },
    [capturedPhotos.length, selectedLayout.photoRegions.length],
  );

  const removePhoto = useCallback((index: number) => {
    setCapturedPhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const resetSession = useCallback(() => {
    setCapturedPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, []);

  const setLayoutWithReset = useCallback((layout: Layout) => {
    setSelectedLayout(layout);
    setCapturedPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, []);

  return {
    selectedFilter,
    setSelectedFilter,
    selectedFrame,
    setSelectedFrame,
    selectedLayout,
    setSelectedLayout: setLayoutWithReset,
    capturedPhotos,
    addPhoto,
    removePhoto,
    canCapture,
    isComplete,
    resetSession,
  };
}
