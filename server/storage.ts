// S3-backed storage helpers (replaces the Manus forge storage proxy).
//
// Requires the following environment variables (see ENV in ./_core/env.ts):
//   S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_PUBLIC_URL
//
// S3_PUBLIC_URL should be the base URL used to serve uploaded files publicly,
// e.g. "https://<bucket>.s3.<region>.amazonaws.com" or a CloudFront/CDN domain.

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    if (!ENV.s3Bucket || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey) {
      throw new Error(
        "S3 storage is not configured: set S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
      );
    }
    _client = new S3Client({
      region: ENV.s3Region,
      credentials: {
        accessKeyId: ENV.s3AccessKeyId,
        secretAccessKey: ENV.s3SecretAccessKey,
      },
    });
  }
  return _client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function publicUrlFor(key: string): string {
  const base = ENV.s3PublicUrl.replace(/\/+$/, "");
  if (base) return `${base}/${key}`;
  return `https://${ENV.s3Bucket}.s3.${ENV.s3Region}.amazonaws.com/${key}`;
}

/**
 * Upload a file to S3 (e.g. diplomas, school lists, product gallery images).
 * The object is stored privately by default; use storageGet() to obtain a
 * temporary signed download URL, or rely on publicUrlFor() if the bucket
 * is configured for public read.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);
  const body = typeof data === "string" ? Buffer.from(data) : data;

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return { key, url: publicUrlFor(key) };
}

/**
 * Returns the object's key together with a temporary signed download URL
 * (valid for 1 hour). Use this for private files such as diplomas.
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }),
    { expiresIn: 3600 }
  );

  return { key, url };
}
