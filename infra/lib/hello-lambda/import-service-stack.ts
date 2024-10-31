import { Stack, type StackProps } from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";

const BUCKET_NAME = "ImportBucket9407";

export class ImportServiceStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, BUCKET_NAME, {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    bucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
      allowedOrigins: ['*'],
      allowedHeaders: ['*']
    });

    const importServicePath = path.join(__dirname, '../../../import-service');
    console.log("importServicePath", importServicePath)

    // create signedUrl
    const importProductsFileFunction = new lambda.Function(
      this,
      "ImportProductsFile",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "build/handler.importProductsFile",
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        code: lambda.Code.fromAsset(importServicePath),
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      },
    );
    bucket.grantReadWrite(importProductsFileFunction);

    // import
    const api = new apigateway.RestApi(this, "ImportApi", {
      restApiName: "Import Service",
    });

    const importResource = api.root.addResource("import", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
        allowCredentials: true,
      },
    });

    importResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(importProductsFileFunction), {
      apiKeyRequired: false
    }
    );

    importProductsFileFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [`${bucket.bucketArn}/uploaded/*`]
    }));

    // Get existing SQS queue
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      "HelloLambdaStack-CatalogItemsQueueB3B6CE23-L25L0iKT53vv",
      "arn:aws:sqs:us-east-1:296062589403:HelloLambdaStack-CatalogItemsQueueB3B6CE23-L25L0iKT53vv",
    );

    const importFileParserFunction = new lambda.Function(
      this,
      "ImportFileParser",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset(importServicePath),
        handler: "build/handler.importFileParser",
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        environment: {
          BUCKET_NAME: bucket.bucketName,
          CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
        },
      },
    );

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserFunction),
      { prefix: "uploaded/" },
    );

    bucket.grantReadWrite(importFileParserFunction);

    catalogItemsQueue.grantSendMessages(importFileParserFunction);
  }
}
