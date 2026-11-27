import crypto from "crypto";

export function signCloudinaryParams(params, apiSecret) {
  const signatureString =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&") + apiSecret;
  return crypto.createHash("sha1").update(signatureString).digest("hex");
}

/**
 * Extracts Cloudinary public_id from a res.cloudinary.com URL.
 * Example: https://res.cloudinary.com/wrtycrdf/image/upload/v1700000000/stickr-catalog/abc.png
 * -> "stickr-catalog/abc"
 */
export function extractPublicIdFromUrl(url, cloudName) {
  if (!url || !cloudName) return "";
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("cloudinary.com")) return "";
    const marker = `/${cloudName}/image/upload/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return "";
    let rest = parsed.pathname.slice(idx + marker.length);
    // Strip optional version segment like v1700000000/
    rest = rest.replace(/^v\d+\//, "");
    // Strip file extension
    return rest.replace(/\.[^/.]+$/, "");
  } catch {
    return "";
  }
}

export async function destroyCloudinaryImage({ publicId, imageUrl }) {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    throw new Error("Cloudinary env vars not configured.");
  }

  const targetId = publicId || extractPublicIdFromUrl(imageUrl, cloudName);
  if (!targetId) {
    return { skipped: true, reason: "Not a Cloudinary URL or missing public_id" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = signCloudinaryParams({ public_id: targetId, timestamp }, apiSecret);

  const form = new URLSearchParams({
    public_id: targetId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    }
  );

  const data = await res.json();
  if (!res.ok || (data.result !== "ok" && data.result !== "not found")) {
    throw new Error(data.error?.message || `Cloudinary delete failed (${data.result || res.status})`);
  }

  return { deleted: true, publicId: targetId, result: data.result };
}
