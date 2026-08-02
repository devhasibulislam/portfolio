import { cloudinary } from "@/lib/cloudinary";

// Route handlers default to the Node.js runtime, which the cloudinary SDK
// requires — no explicit `runtime` export (incompatible with cacheComponents).

/**
 * Signature endpoint for CldUploadWidget signed uploads. The widget POSTs
 * `{ paramsToSign }`, we sign with the api_secret and return `{ signature }`.
 * Response shape is fixed by the widget — do not wrap.
 */
export async function POST(request: Request) {
  const { paramsToSign } = (await request.json()) as {
    paramsToSign: Record<string, string | number>;
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string,
  );

  return Response.json({ signature });
}
