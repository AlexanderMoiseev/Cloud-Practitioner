import { formatJSONResponse } from "../utils/formatJSONResponse";
import ProductService  from "../services/product-service";

export async function getProductByIdHandler(event: { pathParameters: { id: any; }; }) {
  const productId = event.pathParameters?.id;
  const productService = new ProductService();
  
  // todo: add model types
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
