import { formatJSONResponse } from "../utils/formatJSONResponse";
import ProductService  from "../services/product-service";

export const getAllProductsHandler = async () => {
  console.log("*** getAllProductsHandler 11");

  try {
    const productService = new ProductService()
    const availableProducts = await productService.getAllProducts();

    return formatJSONResponse(availableProducts);
  } catch (error) {
    console.log("*** error here ***", error);
    const body = {
      message: error.message || "Something wrong",
    };

    return formatJSONResponse(body, 500);
  } finally {
    console.log("*** done ***");
    // productService.destroy();
  }
};
