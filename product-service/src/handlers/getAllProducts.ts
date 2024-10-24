import { formatJSONResponse } from "../utils/formatJSONResponse";
import ProductService  from "../services/product-service";
import DynamoDBProductService from "../services/dynamodb-product-service";

export const getAllProductsHandler = async (event) => {
  console.log("*** getAllProductsHandler db ***");
  console.log("Incoming event: ", JSON.stringify(event));

  try {
    const productService = new DynamoDBProductService()
    const availableProducts = await productService.getAllProducts();


    return formatJSONResponse(availableProducts);
  } catch (error) {
    console.log("*** error getAllProductsHandler ***", error);
    const body = {
      message: error.message || "Something wrong",
    };

    return formatJSONResponse(body, 500);
  } finally {
    console.log("*** getAllProductsHandler done ***");
  }
};
