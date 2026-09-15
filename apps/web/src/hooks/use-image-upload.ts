import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/api/upload-image";

/** Hidden file input wiring: uploads the picked image, reports progress and resets the input for re-picks. */
export const useImageUpload = (onUploaded: (url: string) => void) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      onUploaded(await uploadImage(file));
      toast.success("Tải ảnh lên thành công!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return { inputRef, isUploading, onFile };
};
