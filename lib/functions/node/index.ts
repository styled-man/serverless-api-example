import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new S3Client();

export async function handler(event: APIGatewayProxyEvent, context: unknown) {
  const body = JSON.parse(event.body || "");

  if (!body) {
    return {
      statusCode: 400,
    };
  }

  const url = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: body.objectName,
    }),
    { expiresIn: 3600 }
  );

  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
}
