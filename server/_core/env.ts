export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_EMAIL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  s3Bucket: process.env.S3_BUCKET_NAME ?? "",
  s3Region: process.env.AWS_REGION ?? "us-east-1",
  s3AccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  s3PublicUrl: process.env.S3_PUBLIC_URL ?? "",
};
