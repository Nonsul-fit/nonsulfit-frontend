/// <reference types="node" />

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type {
  BackendChatMessageDto,
  ChatHistoryResponseDto,
} from "../../contracts/chat.ts";
import {
  chatHistoryMapper,
  chatMessageMapper,
  createSendChatMessageRequest,
} from "../../adapters/chatMessageMapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(currentDir, "../..");
const fixtureRoot = resolve(sourceRoot, "fixtures/contracts");

const readFixture = <T>(name: string): T =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8")) as T;

test("chat history fixture maps to deterministic user and assistant view models", () => {
  const history = readFixture<ChatHistoryResponseDto>("chat-history.json");
  const first = chatHistoryMapper(history);
  const second = chatHistoryMapper(history);

  assert.deepEqual(
    first.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      warnings: message.warnings,
    })),
    second.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      warnings: message.warnings,
    })),
  );
});

test("regression_chat_request_sends_message_field_only", () => {
  const request = createSendChatMessageRequest("질문입니다") as unknown as Record<
    string,
    unknown
  >;

  assert.deepEqual(request, { message: "질문입니다" });
  assert.equal("role" in request, false);
  assert.equal("content" in request, false);
});

test("chat warning response preserves fallback status and warnings", () => {
  const response = readFixture<BackendChatMessageDto>(
    "chat-warning-response.json",
  );
  const mapped = chatMessageMapper(response);

  assert.equal(mapped.role, "assistant");
  assert.equal(mapped.status, "FALLBACK");
  assert.deepEqual(mapped.warnings, [
    "report_snapshot_missing",
    "fallback_answer_used",
  ]);
});

test("chat UI source renders optimistic user message and server assistant response", () => {
  const source = readFileSync(
    resolve(sourceRoot, "components/organisms/ChatBtn.tsx"),
    "utf8",
  );

  assert.equal(source.includes("role: \"user\""), true);
  assert.equal(source.includes("sendChatMessage(reportId, userMessage)"), true);
  assert.equal(source.includes("reportSnapshot"), false);
});
