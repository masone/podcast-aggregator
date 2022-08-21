import { basename } from "path";
import { readFileSync } from "fs";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import config, { coverUrl } from "./config.js";

const endpoint = config.aws.host ? `https://${config.aws.host}` : undefined;
const bucket = config.aws.bucket;

const s3Client = new S3Client({
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function checkExists(path: string): Promise<boolean> {
  try {
    await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: path,
      })
    );
    return true;
  } catch (err: unknown) {
    const errWithCode = err as { Code: string };
    if (errWithCode.Code === "NoSuchKey") {
      return false;
    }
    throw err;
  }
}

async function create(
  path: string,
  body: string | Buffer,
  contentType: string
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: body,
      ACL: "public-read",
      ContentType: contentType,
    })
  );
}

export async function upload(fullPath: string): Promise<void> {
  const path = basename(fullPath);
  const exists = await checkExists(path);

  if (!exists) {
    await create(path, readFileSync(fullPath), "audio/mpeg");
  }
}

export async function publish(xml: string): Promise<void> {
  await create(
    basename(coverUrl()),
    readFileSync(config.feed.cover),
    "image/png"
  );
  await create(`${config.feed.slug}.xml`, xml, "application/xml");
}
