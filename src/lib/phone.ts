const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EN_DIGITS = "0123456789";

/** تطبيع رقم الموبايل: أرقام عربية ← إنجليزية، إزالة مسافات وشرطات، توحيد البادئة. */
export function normalizeEgyptianPhone(raw: string): string {
  let s = raw.trim();
  s = s
    .split("")
    .map((ch) => {
      const i = AR_DIGITS.indexOf(ch);
      return i >= 0 ? EN_DIGITS[i] : ch;
    })
    .join("");
  s = s.replace(/[\s\-()]/g, "");
  if (s.startsWith("+20")) s = "0" + s.slice(3);
  else if (s.startsWith("0020")) s = "0" + s.slice(4);
  return s;
}

/** صالح: 010/011/012/015 + 8 أرقام. */
export function isValidEgyptianPhone(raw: string): boolean {
  return /^01[0125][0-9]{8}$/.test(normalizeEgyptianPhone(raw));
}
