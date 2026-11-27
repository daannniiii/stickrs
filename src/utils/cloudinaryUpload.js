// Uploads & deletes images on Cloudinary using server-signed endpoints.

export async function uploadToCloudinary(file, token) {
  const signRes = await fetch("/api/sign-upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const signData = await signRes.json();

  if (!signRes.ok) {
    throw new Error(signData.error || "Failed to get Cloudinary upload signature");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.api_key);
  formData.append("timestamp", String(signData.timestamp));
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`,
    { method: "POST", body: formData }
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(uploadData.error?.message || "Cloudinary upload failed");
  }

  return {
    url: uploadData.secure_url,
    publicId: uploadData.public_id,
  };
}

export async function deleteFromCloudinary({ publicId, imageUrl }, token) {
  const res = await fetch("/api/delete-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ publicId, imageUrl }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete image from Cloudinary");
  }
  return data;
}
