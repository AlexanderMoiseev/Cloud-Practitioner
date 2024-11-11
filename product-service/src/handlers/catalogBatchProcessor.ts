import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

import { createProduct } from "../utils/create-product-helper";
import { getConfig } from "../utils/getConfig";

const PRODUCTS_TABLE = 'products';
const STOCKS_TABLE = 'stock';

export const catalogBatchProcessHandler = async (event: SQSEvent) => {
  console.log("Incoming event: ", event);
  const { region, sns_topic_arn } = getConfig();
  console.log("region: ", region);

  const snsClient = new SNSClient({ region: region });

  for (const record of event.Records) {
    const body = JSON.parse(record.body);

    console.log("parsed project body : ", body);

    try {
      const { productId, productItem } = await createProduct(
        body,
        PRODUCTS_TABLE,
        STOCKS_TABLE,
      );
      console.log(
        `Product created with id: ${productId}, item: ${JSON.stringify(
          productItem,
        )}`,
      );

      // Publish message to SNS topic
      const publishCommand = new PublishCommand({
        TopicArn: sns_topic_arn,
        Message: JSON.stringify(productItem),
        Subject: "New Product Created",
      });
      await snsClient.send(publishCommand);
    } catch (dbError) {
      console.error(`Error creating product:`, dbError);
    }
  }
};
