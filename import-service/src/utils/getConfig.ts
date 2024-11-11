export const getConfig = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  const bucketName = process.env.BUCKET_NAME;
  const sqsUrl = process.env.SQS_URL;
  const catalogItemsSQSQueue = process.env.CATALOG_ITEMS_QUEUE_URL || "";

  return {
    region,
    bucketName,
    sqsUrl,
    catalogItemsSQSQueue
  };
};
