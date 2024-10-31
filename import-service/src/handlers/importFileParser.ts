import {
  CopyObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import csv from "csv-parser";
import { formatJSONResponse, getConfig } from '../utils';
import { Readable } from "stream";

const { region, catalogItemsSQSQueue } = getConfig();

export const importFileParserHandler = async (event) => {
  console.log("*** Event: ", event);
  const sqsClient = new SQSClient({ region });

  const s3 = new S3Client({ region });

  const record = event.Records[0];
  const { bucket, object } = record.s3;
  const bucketName = bucket.name;
  const { key } = object;
  const fileName = decodeURIComponent(key.replace(/\+/g, " "));

  const params = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    const getObjectCommand = new GetObjectCommand(params);
    const data = await s3.send(getObjectCommand);

    if (!data.Body) {
      throw new Error("No data found in the S3 object.");
    }

    const records: any[] = [];
    const readableStream = data.Body as Readable;

    console.log("Start Processing stream from file:", fileName);

    await new Promise<void>((resolve, reject) => {
      readableStream
        .pipe(csv({
          mapHeaders: ({ header }) => header.trim(),
          //NOTE : Specify the delimiter used in your CSV file.
          separator: ';'
        }))
        .on("data", async (row) => {
          try {
            console.log("Sent message to SQS:", row);

            const sendMessageCommand = new SendMessageCommand({
              QueueUrl: catalogItemsSQSQueue,
              MessageBody: JSON.stringify(row),
            });
            await sqsClient.send(sendMessageCommand);
            console.log("Sent message to SQS completed:");
            records.push(row);
          } catch (err) {
            console.error("Error sending message to SQS:", err);
            reject(new Error(String(err)));
          }
        })
        .on("end", async () => {
          const newKey = `parsed/${key.split("/").pop()}`;

          const copyObjectCommand = new CopyObjectCommand({
            Bucket: bucketName,
            CopySource: `${bucketName}/${key}`,
            Key: newKey,
          });
          await s3.send(copyObjectCommand);

          const deleteObjectCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          });
          await s3.send(deleteObjectCommand);

          console.log(`Moved object from ${key} to ${newKey}`);

          console.log("CSV file successfully processed");
          resolve();
        })
        .on("error", (error) => {
          console.error("Error processing CSV file", error);
          reject(error);
        });
    });

    console.log("End Processing stream:");
    return formatJSONResponse({ message: "Parsing is done" });
  } catch (error) {
    const body = {
      message: error.message || "Something went wrong",
    };


    return formatJSONResponse(body, 500);
  } finally {
    s3.destroy();
    sqsClient.destroy();
  }
};

