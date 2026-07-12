import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { CreatorProfile, ApiResponse } from "../shared/types";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" })
);

const TABLE = process.env.PROFILES_TABLE ?? "nichespark-profiles";

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
    // POST /profile — save/update profile
    if (method === "POST") {
      if (!event.body) return err(400, "Missing body");

      const incoming = JSON.parse(event.body) as Omit<CreatorProfile, "createdAt" | "updatedAt">;
      const now = new Date().toISOString();

      // Check if profile already exists to preserve createdAt
      const existing = await ddb.send(
        new GetCommand({ TableName: TABLE, Key: { userId: incoming.userId } })
      );

      const profile: CreatorProfile = {
        ...incoming,
        createdAt: (existing.Item as CreatorProfile | undefined)?.createdAt ?? now,
        updatedAt: now,
      };

      await ddb.send(new PutCommand({ TableName: TABLE, Item: profile }));
      return ok(profile);
    }

    // GET /profile/{userId}
    if (method === "GET") {
      const userId = event.pathParameters?.userId;
      if (!userId) return err(400, "Missing userId");

      const result = await ddb.send(
        new GetCommand({ TableName: TABLE, Key: { userId } })
      );

      if (!result.Item) return err(404, "Profile not found");
      return ok(result.Item as CreatorProfile);
    }

    return err(405, "Method not allowed");
  } catch (e) {
    console.error("saveProfile error:", e);
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
