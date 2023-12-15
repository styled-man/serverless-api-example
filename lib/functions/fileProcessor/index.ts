import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayProxyEvent } from "aws-lambda";

const client = new S3Client();

export async function handler(event: APIGatewayProxyEvent, context: unknown) {
  console.log(event)
  return "Done processing"
}
