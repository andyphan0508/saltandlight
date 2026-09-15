/** Uploads an image through the admin media route and returns its public URL. Throws the server's error message. */
export const uploadImage = async (file: File): Promise<string> => {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/media/upload", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Tải ảnh thất bại");
  return data.url;
};
