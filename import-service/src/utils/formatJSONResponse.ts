const defaultHeaders = {
  "Content-Type": "*",
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
};

export const formatJSONResponse = (body, statusCode = 200) => ({
  headers: {
    ...defaultHeaders,
  },
  statusCode,
  body: JSON.stringify(body, null, 2),
});
