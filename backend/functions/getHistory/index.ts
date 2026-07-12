import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { ApiResponse } from "../shared/types";

interface IdeaSession {
  sessionId: string;
  userId: string;
  vibe: string;
  ideas: unknown[];
  createdAt: string;
}

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" })
);

const TABLE = process.env.SESSIONS_TABLE ?? "nichespark-sessions";

const CORS = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const method = event.requestContext.http.method;

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    // POST /history — save a session
    if (method === "POST") {
      if (!event.body) return err(400, "Missing body");
      const session = JSON.parse(event.body) as IdeaSession;
      await ddb.send(new PutCommand({ TableName: TABLE, Item: session }));
      return ok(session);
    }

    // GET /history/{userId}
    if (method === "GET") {
      const userId = event.pathParameters?.userId;
      if (!userId) return err(400, "Missing userId");

      const result = await ddb.send(
        new QueryCommand({
          TableName: TABLE,
          KeyConditionExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
          ScanIndexForward: false, // newest first
          Limit: 20,
        })
      );

      return ok(result.Items ?? []);
    }

    return err(405, "Method not allowed");
  } catch (e) {
    console.error("getHistory error:", e);
    return err(500, e instanceof Error ? e.message : "Internal error");
  }
};

function ok<T>(data: T) {
  const body: ApiResponse<T> = { success: true, data };
  return { statusCode: 200, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

function err(statusCode: number, message: string) {
  const body: ApiResponse<never> = { success: false, error: message };
  return { statusCode, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
