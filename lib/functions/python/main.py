import boto3
from botocore.exceptions import ClientError
import json
import os

s3_client = boto3.client("s3")


def handler(event, context):
    body = json.loads(event["body"])
    
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": os.getenv("S3_BUCKET_NAME"),
                "Key": body["objectName"],
            },
            ExpiresIn=3600,
        )
        return {"statusCode": 200, "body": url}

    except ClientError as e:
        return {"statusCode": 500, "body": json.dumps(e)}
