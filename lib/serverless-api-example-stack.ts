import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha"; // `npm install @aws-cdk/aws-lambda-python-alpha`
import {
  aws_lambda as lambda,
  aws_apigateway as apigateway,
  aws_s3 as s3,
  aws_lambda_event_sources as lambdaEventSources,
} from "aws-cdk-lib";
import { join } from "path";

export class ServerlessApiExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda functions
    // this will smartly get every javascript/typescript files that you import that as long as it is co-located inside of the node folder
    const nodeFunctionExample = new NodejsFunction(this, "NodeFunction", {
      entry: join(__dirname, "functions", "node", "index.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
    });

    // // this will smartly get every python files that you import that as long as it is co-located inside of the node folder
    // // it will also install stuff from requirements.txt
    const pythonFunctionExample = new PythonFunction(this, "PythonFunction", {
      entry: join(__dirname, "functions", "python"),
      index: "main.py",
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.minutes(5),
    });

    // the api
    const restApi = new apigateway.LambdaRestApi(this, "RestApi", {
      handler: nodeFunctionExample, // a default fallback function
      proxy: false,
    });

    // adding routes to the api
    const apiRoute = restApi.root.addResource("my-route"); // https://random-id/prod/my-route
    const nestedRoute = apiRoute.addResource("nested-route"); // https://random-id/prod/my-route/nested-route

    // adding methods to the api/routes
    restApi.root.addMethod(
      "POST", // POST, GET, PUT...
      new apigateway.LambdaIntegration(nodeFunctionExample) // the lambda function that handles this method
    );

    nestedRoute.addMethod(
      "POST",
      new apigateway.LambdaIntegration(pythonFunctionExample)
    );

    // You can just import an s3 bucket but I'm opting to creating one just so it can be easier
    const myBucket = new s3.Bucket(this, "S3Bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const processNewFIles = new NodejsFunction(this, "FileProcessor", {
      entry: join(__dirname, "functions", "fileProcessor", "index.ts"),
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
    });

    processNewFIles.addEventSource(
      new lambdaEventSources.S3EventSource(myBucket, {
        events: [s3.EventType.OBJECT_CREATED],
      })
    );

    // give lambda functions permission to read from s3 bucket
    myBucket.grantRead(nodeFunctionExample);
    myBucket.grantRead(pythonFunctionExample);

    // adding the name of the bucket as an environment variables to the functions
    nodeFunctionExample.addEnvironment("S3_BUCKET_NAME", myBucket.bucketName);
    pythonFunctionExample.addEnvironment("S3_BUCKET_NAME", myBucket.bucketName);
  }
}
