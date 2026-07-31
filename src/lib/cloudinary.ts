import { v2 as cloudinary } from "cloudinary";

/**
 * Server-only Cloudinary config. Node SDK v2. Never import into client code
 * — CLOUDINARY_API_SECRET must not reach the browser.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
