import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { getMappedProducts } from "../utils/mapped-products";
import { createProduct } from "../utils/create-product-helper";

const PRODUCTS_TABLE = 'products';
const STOCKS_TABLE = 'stock';

const dynamoDb = DynamoDBDocument.from(new DynamoDB());

export default class DynamoDBProductService {

  async getAllProducts() {
    const productsData = await dynamoDb.scan({
      TableName: PRODUCTS_TABLE,
    });

    const stocksData = await dynamoDb.scan({
      TableName: STOCKS_TABLE,
    });

    const mappedProducts = getMappedProducts(
      productsData.Items,
      stocksData.Items,
    );

    return mappedProducts;
  }

  async getProductById(productId: string) {

    const productData = await dynamoDb.query({
      TableName: PRODUCTS_TABLE,
      KeyConditionExpression: "#id = :id",
      ExpressionAttributeNames: {
        "#id": "id",
      },
      ExpressionAttributeValues: {
        ":id": productId,
      },
    });

    if (!productData?.Items?.length) {
      return null;
    }

    const stockData = await dynamoDb.query({
      TableName: STOCKS_TABLE,
      KeyConditionExpression: "#product_id = :product_id",
      ExpressionAttributeNames: {
        "#product_id": "product_id",
      },
      ExpressionAttributeValues: {
        ":product_id": productId,
      },
    });

    const count = stockData?.Items?.length ? stockData.Items[0].count : 0;

    const product = {
      ...productData?.Items[0],
      count,
    };

    return product;
  }

  async createProduct(itemObject: any) {

    const { productId, productItem } = await createProduct(
      itemObject,
      PRODUCTS_TABLE,
      STOCKS_TABLE,
    );

    return { productId, productItem };
  }
}
