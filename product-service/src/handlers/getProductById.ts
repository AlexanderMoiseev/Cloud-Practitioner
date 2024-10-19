import { formatJSONResponse } from "../utils/formatJSONResponse";
import DynamoDBProductService from "../services/dynamodb-product-service";

export async function getProductByIdHandler(event: { pathParameters: { id: any; }; }) {
  console.log("Incoming event: ", JSON.stringify(event));

  const productId = event.pathParameters?.id;
  if (!productId) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/plain" },
      body: 'Product ID not provided',
    };
  }

  const productService = new DynamoDBProductService();
  
  const product = await productService.getProductById(productId);
  
  if (!product) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/plain" },
      body: 'Product_not_found',
    };
  }
  return formatJSONResponse(product);

}
