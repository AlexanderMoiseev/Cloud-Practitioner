const defaultHeaders = {
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
};

export const formatJSONResponse = (body, statusCode = 200) => ({
  headers: {
    ...defaultHeaders,
  },
  statusCode,
  body: JSON.stringify(body, null, 2),
});
