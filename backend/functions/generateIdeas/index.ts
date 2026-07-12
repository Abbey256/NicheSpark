import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { runIdeaChain } from "./bedrock";
import type { GenerateIdeasRequest, ApiResponse, GenerateIdeasResponse } from "../shared/types";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.FRONTEND_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  // Handle preflight
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    if (!event.body) {
      return respond(400, { success: false, error: "Missing request body" });
    }

    const request = JSON.parse(event.body) as GenerateIdeasRequest;

    if (!request.profile || !request.vibe || !request.platforms?.length) {
      return respond(400, {
        success: false,
        error: "profile, vibe, and platforms are required",
      });
    }

    const result = await runIdeaChain(request);

    return respond<GenerateIdeasResponse>(200, { success: true, data: result });
  } catch (err) {
    console.error("generateIdeas error:", err);
    return respond(500, {
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
};

function respond<T>(
  statusCode: number,
  body: ApiResponse<T>
): ReturnType<typeof handler> extends Promise<infer R> ? R : never {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  } as never;
}
