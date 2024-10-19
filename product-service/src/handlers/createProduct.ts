import { formatJSONResponse } from "../utils/formatJSONResponse";
import DynamoDBProductService from "../services/dynamodb-product-service";

export const createProductHandler = async (event) => {
  console.log("*** createProductHandler post ***");
  console.log("Incoming event: ", JSON.stringify(event));

  if (!event.body) {
    const body = {
      message: "invalid request, you are missing the parameter body_",
    };
    return formatJSONResponse(body, 400);
  }

  try {
    const itemObject =
      typeof event.body == "object" ? event.body : JSON.parse(event.body);

    const productService = new DynamoDBProductService()
    const product = await productService.createProduct(itemObject);

    return formatJSONResponse({ product });
  } catch (error) {
    const body = {
      message: error.message || "Something went wrong",
    };

    return formatJSONResponse(body, 500);
  }
};
