/**
 * bedrock.ts — Direct Bedrock client for local development.
 *
 * For production, swap VITE_BEDROCK_MODE=lambda and all calls
 * go through the Lambda proxy in /backend instead.
 *
 * Required .env.local keys:
 *   VITE_AWS_REGION=us-east-1
 *   VITE_AWS_ACCESS_KEY_ID=...
 *   VITE_AWS_SECRET_ACCESS_KEY=...
 *   VITE_BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
 */
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const REGION = import.meta.env.VITE_AWS_REGION ?? "us-east-1";
const MODEL  = import.meta.env.VITE_BEDROCK_MODEL
  ?? "anthropic.claude-3-haiku-20240307-v1:0";

function makeClient(): BedrockRuntimeClient {
  const accessKeyId     = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const sessionToken    = import.meta.env.VITE_AWS_SESSION_TOKEN;

  return new BedrockRuntimeClient({
    region: REGION,
    credentials: accessKeyId
      ? { accessKeyId, secretAccessKey, sessionToken }
      : undefined, // falls back to default credential chain
  });
}

export async function invokeclaude(
  system: string,
  user: string,
  maxTokens = 4096
): Promise<string> {
  const client = makeClient();

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const cmd = new InvokeModelCommand({
    modelId: MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const res  = await client.send(cmd);
  const json = JSON.parse(new TextDecoder().decode(res.body)) as {
    content: { type: string; text: string }[];
  };

  return json.content[0].text.trim();
}
