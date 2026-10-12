import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("يدمج الكلاسات ويتجاهل الفارغ", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("يرجع نصًا فارغًا بدون مدخلات", () => {
    expect(cn()).toBe("");
  });
});
