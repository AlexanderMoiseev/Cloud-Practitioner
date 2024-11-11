
export const getConfig = () => {
  const region = "us-east-1";
  const sns_topic_arn = 'arn:aws:sns:us-east-1:296062589403:HelloLambdaStack-CreateProductTopicE4CD9217-yJZVtVkNy5zi' ;

  return {
    region,
    sns_topic_arn,
  };
};
