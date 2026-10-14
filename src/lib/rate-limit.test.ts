import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/lib/rate-limit";

let keyCounter = 0;
function uniqueKey() {
  keyCounter += 1;
  return `teste:${keyCounter}`;
}

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("libera até o limite e informa quantas restam", () => {
    const key = uniqueKey();
    expect(checkRateLimit(key, 3, 60_000)).toEqual({
      allowed: true,
      retryAfterMs: 0,
      remaining: 2,
    });
    expect(checkRateLimit(key, 3, 60_000).remaining).toBe(1);
    expect(checkRateLimit(key, 3, 60_000).remaining).toBe(0);
  });

  it("bloqueia acima do limite e informa quando a janela reabre", () => {
    const key = uniqueKey();
    checkRateLimit(key, 2, 60_000);
    checkRateLimit(key, 2, 60_000);
    vi.advanceTimersByTime(15_000);

    const blocked = checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBe(45_000);
  });

  it("reabre a janela depois do intervalo", () => {
    const key = uniqueKey();
    checkRateLimit(key, 1, 60_000);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false);

    vi.advanceTimersByTime(60_000);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
  });

  it("conta cada chave separadamente", () => {
    const a = uniqueKey();
    const b = uniqueKey();
    checkRateLimit(a, 1, 60_000);
    expect(checkRateLimit(a, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(b, 1, 60_000).allowed).toBe(true);
  });
});
