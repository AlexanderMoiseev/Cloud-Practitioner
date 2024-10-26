import { Stack, type StackProps } from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'; // Add this line
import * as dynamoDb from "aws-cdk-lib/aws-dynamodb";

export class HelloLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const productsTable = dynamoDb.Table.fromTableName(
      this,
      "products",
      "products",
    );
    const stockTable = dynamoDb.Table.fromTableName(this, "stock", "stock");

    const helloLambdaFunction = new lambda.Function(this, 'lambda-function', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'handler.main',
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
    });


    const productServicePath = path.join(__dirname, '../../../product-service');
    console.log("productServicePath", productServicePath)

    const productsLambdaFunction = new lambda.Function(this, 'ProductsLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'build/handler.getAllProducts', // Specify the handler function for products
      code: lambda.Code.fromAsset(productServicePath),
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stockTable.tableName,
      },
    });
    productsTable.grantReadWriteData(productsLambdaFunction);
    stockTable.grantReadWriteData(productsLambdaFunction);

    const getProductByIdLambdaFunction = new lambda.Function(this, 'GetProductByIdLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: 'build/handler.getProductById',
      code: lambda.Code.fromAsset(productServicePath),
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stockTable.tableName,
      },
    });

    productsTable.grantReadWriteData(getProductByIdLambdaFunction);
    stockTable.grantReadWriteData(getProductByIdLambdaFunction);


    // create product
    const createProductFunction = new lambda.Function(this, "CreateProductLambdaFunction", {
      code: lambda.Code.fromAsset(productServicePath),
      handler: 'build/handler.createProduct',
      timeout: cdk.Duration.seconds(10),
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stockTable.tableName,
      },
    });

    productsTable.grantReadWriteData(createProductFunction);
    stockTable.grantReadWriteData(createProductFunction);


    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions."
    });

    // hello lambda config
    const helloFromLambdaIntegration = new apigateway.LambdaIntegration(helloLambdaFunction, {});
    // Create a resource /hello and GET request under it
    const helloResource = api.root.addResource("hello");
    // On this resource attach a GET method which pass reuest to our Lambda function
    helloResource.addMethod('GET', helloFromLambdaIntegration);

    // /products
    const productsResource = api.root.addResource("products");
    productsResource.addMethod('GET', new apigateway.LambdaIntegration(productsLambdaFunction));

    // Configure /products/{id} GET method
    const productByIdResource = productsResource.addResource("{id}");
    productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductByIdLambdaFunction));

    // Configure POST create product method
    // const createProductResource = productsResource.addResource("create");
    productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductFunction));

    productsResource.addCorsPreflight({
      allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
      allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
      allowHeaders: cdk.aws_apigateway.Cors.DEFAULT_HEADERS,
    });

  }
}



// const productsResource = api.root.addResource("products");
// productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProductFunction), {
//   // Enable CORS
//   authorizationType: apigateway.AuthorizationType.NONE, // Ensure no authorization for CORS preflight
//   methodResponses: [{
//     statusCode: '200',
//     responseParameters: {
//       'method.response.header.Access-Control-Allow-Origin': true,
//       'method.response.header.Access-Control-Allow-Headers': true,
//       'method.response.header.Access-Control-Allow-Methods': true
//     }
//   }]
// });

// // Add CORS options
// productsResource.addCorsPreflight({
//   allowOrigins: apigateway.Cors.ALL_ORIGINS,
//   allowMethods: apigateway.Cors.ALL_METHODS,
//   allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
// });