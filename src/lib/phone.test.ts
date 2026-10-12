import { describe, expect, it } from "vitest";
import { isValidEgyptianPhone, normalizeEgyptianPhone } from "./phone";

describe("normalizeEgyptianPhone", () => {
  it("يوحّد الأرقام العربية والبادئات", () => {
    expect(normalizeEgyptianPhone("٠١٠٩١٤٢٩٦٢٩")).toBe("01091429629");
    expect(normalizeEgyptianPhone("+20 109 142 9629")).toBe("01091429629");
    expect(normalizeEgyptianPhone("00201091429629")).toBe("01091429629");
    expect(normalizeEgyptianPhone("010-9142-9629")).toBe("01091429629");
  });
});

describe("isValidEgyptianPhone", () => {
  it("يقبل الشبكات الأربع", () => {
    expect(isValidEgyptianPhone("01091429629")).toBe(true);
    expect(isValidEgyptianPhone("01112345678")).toBe(true);
    expect(isValidEgyptianPhone("01212345678")).toBe(true);
    expect(isValidEgyptianPhone("01512345678")).toBe(true);
  });

  it("يرفض الصيغ الخاطئة", () => {
    expect(isValidEgyptianPhone("0109142962")).toBe(false); // 10 أرقام
    expect(isValidEgyptianPhone("010914296299")).toBe(false); // 12 رقم
    expect(isValidEgyptianPhone("01912345678")).toBe(false); // شبكة غير موجودة
    expect(isValidEgyptianPhone("abc")).toBe(false);
    expect(isValidEgyptianPhone("")).toBe(false);
  });
});
