export const getConfig = () => {
  const region = process.env.AWS_REGION || "us-east-1";
  const bucketName = process.env.BUCKET_NAME;

  return {
    region,
    bucketName,
  };
};
