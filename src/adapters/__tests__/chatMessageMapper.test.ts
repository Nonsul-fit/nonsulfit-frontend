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
} from "../chatMessageMapper.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(currentDir, "../../fixtures/contracts");

const readFixture = <T>(name: string): T =>
  JSON.parse(readFileSync(resolve(fixtureRoot, name), "utf8")) as T;

test("chatMessageMapper_maps_user_message", () => {
  const history = readFixture<ChatHistoryResponseDto>("chat-history.json");
  const message = chatMessageMapper(history.chat[0]!);

  assert.deepEqual(
    {
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt?.toISOString(),
      warnings: message.warnings,
    },
    {
      id: "1",
      role: "user",
      content: "이 리포트에서 가장 중요한 준비 포인트가 뭐야?",
      createdAt: "2026-07-10T04:30:00.000Z",
      warnings: [],
    },
  );
});

test("chatMessageMapper_maps_assistant_message", () => {
  const response = readFixture<BackendChatMessageDto>("chat-send-response.json");
  const message = chatMessageMapper(response);

  assert.equal(message.role, "assistant");
  assert.equal(
    message.content,
    "좋습니다. 해당 대학은 제시문 독해와 비교 논증을 먼저 점검하세요.",
  );
});

test("chatMessageMapper_preserves_warnings", () => {
  const history = readFixture<ChatHistoryResponseDto>("chat-history.json");
  const messages = chatHistoryMapper(history);

  assert.deepEqual(messages[1]?.warnings, ["source_context_limited"]);
});

test("chatMessageMapper_handles_invalid_created_at_as_null", () => {
  const response = readFixture<BackendChatMessageDto>("chat-warning-response.json");
  const message = chatMessageMapper(response);

  assert.equal(message.createdAt, null);
});

test("chatMessageMapper_does_not_require_system_from_backend", () => {
  const history = readFixture<ChatHistoryResponseDto>("chat-history.json");
  const roles = chatHistoryMapper(history).map((message) => message.role);

  assert.deepEqual(roles, ["user", "assistant"]);
});

test("chatMessageMapper_preserves_status_and_warnings_on_fallback_response", () => {
  const response = readFixture<BackendChatMessageDto>("chat-warning-response.json");
  const message = chatMessageMapper(response);

  assert.equal(message.status, "FALLBACK");
  assert.deepEqual(message.warnings, [
    "report_snapshot_missing",
    "fallback_answer_used",
  ]);
});

test("createSendChatMessageRequest_returns_message_only", () => {
  assert.deepEqual(createSendChatMessageRequest("안녕"), { message: "안녕" });
});

test("createSendChatMessageRequest_never_emits_role_or_content_fields", () => {
  const request = createSendChatMessageRequest("안녕") as unknown as Record<
    string,
    unknown
  >;

  assert.equal("role" in request, false);
  assert.equal("content" in request, false);
  assert.deepEqual(Object.keys(request), ["message"]);
});
