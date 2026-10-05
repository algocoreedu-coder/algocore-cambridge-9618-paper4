import type { Localized } from "./catalog";

type Rational = { n: bigint; d: bigint };
const L = (en: string, vi: string): Localized => ({ en, vi });
function gcd(a: bigint, b: bigint): bigint { a = a < 0n ? -a : a; while (b) [a, b] = [b, a % b]; return a || 1n; }
function rational(n: bigint, d = 1n): Rational { if (!d) throw new Error("Zero denominator"); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d); return { n: n / g, d: d / g }; }
function multiply(a: Rational, b: Rational): Rational { return rational(a.n * b.n, a.d * b.d); }
function divide(a: Rational, b: Rational): Rational { return rational(a.n * b.d, a.d * b.n); }
function subtract(a: Rational, b: Rational): Rational { return rational(a.n * b.d - b.n * a.d, a.d * b.d); }
function compare(a: Rational, b: Rational): number { const difference = a.n * b.d - b.n * a.d; return difference < 0n ? -1 : difference > 0n ? 1 : 0; }
function power2(exponent: number): Rational { return exponent >= 0 ? rational(2n ** BigInt(exponent)) : rational(1n, 2n ** BigInt(-exponent)); }
function absolute(value: Rational): Rational { return { n: value.n < 0n ? -value.n : value.n, d: value.d }; }
function parseDecimal(input: string): Rational {
  if (input.length > 40 || !/^[+-]?\d+(?:\.\d+)?$/.test(input.trim())) throw new Error("Enter a decimal number, for example -13.25.");
  const text = input.trim(); const negative = text.startsWith("-"); const [integer, fraction = ""] = text.replace(/^[+-]/, "").split(".");
  return rational(BigInt(integer + fraction) * (negative ? -1n : 1n), 10n ** BigInt(fraction.length));
}
function fractionText(value: Rational): string { return value.d === 1n ? String(value.n) : `${value.n}/${value.d}`; }
function valueText(value: Rational): string {
  const sign = value.n < 0n ? "-" : ""; const n = value.n < 0n ? -value.n : value.n;
  let remainder = n % value.d; let digits = "";
  for (let i = 0; remainder && i < 12; i++) { remainder *= 10n; digits += String(remainder / value.d); remainder %= value.d; }
  return remainder ? fractionText(value) : `${sign}${n / value.d}${digits ? `.${digits}` : ""}`;
}
function validateWidths(mBits: number, eBits: number) {
  if (!Number.isInteger(mBits) || !Number.isInteger(eBits) || mBits < 3 || mBits > 12 || eBits < 2 || eBits > 6) throw new Error("Supported formats use 3–12 mantissa bits and 2–6 exponent bits.");
}
function bitString(value: number, width: number): string { if (!Number.isInteger(value) || value < -(2 ** (width - 1)) || value >= 2 ** (width - 1)) throw new Error("Signed value outside bit width"); return (value < 0 ? value + 2 ** width : value).toString(2).padStart(width, "0"); }
function signed(bits: string): number { if (!/^[01]+$/.test(bits)) throw new Error("Bits must contain only 0 and 1."); const n = parseInt(bits, 2); return bits[0] === "1" ? n - 2 ** bits.length : n; }
function decode(mantissa: string, exponent: string): Rational { return multiply(rational(BigInt(signed(mantissa)), 2n ** BigInt(mantissa.length - 1)), power2(signed(exponent))); }
function binaryMagnitude(value: Rational): string {
  const n = absolute(value).n; const d = value.d; let remainder = n % d; let fractional = "";
  for (let i = 0; remainder && i < 40; i++) { remainder *= 2n; fractional += String(remainder / d); remainder %= d; }
  return `${(n / d).toString(2)}${fractional ? `.${fractional}${remainder ? "…" : ""}` : ""}`;
}
/** Exact long division. Parentheses denote a detected repeating cycle, never a rounded tail. */
function binaryExpansion(value: Rational): { text: string; repeats: boolean } {
  const magnitude = absolute(value); const integer = magnitude.n / magnitude.d;
  let remainder = magnitude.n % magnitude.d; let fraction = "";
  const seen = new Map<bigint, number>();
  while (remainder && fraction.length < 64) {
    const cycleStart = seen.get(remainder);
    if (cycleStart !== undefined) return { text: `${integer.toString(2)}.${fraction.slice(0, cycleStart)}(${fraction.slice(cycleStart)})`, repeats: true };
    seen.set(remainder, fraction.length);
    remainder *= 2n; fraction += String(remainder / magnitude.d); remainder %= magnitude.d;
  }
  return { text: `${integer.toString(2)}${fraction ? `.${fraction}${remainder ? "…" : ""}` : ""}`, repeats: false };
}
function exponentBounds(eBits: number) { return { min: -(2 ** (eBits - 1)), max: 2 ** (eBits - 1) - 1 }; }
function normalisedInteger(value: number, mBits: number): boolean { return value > 0 ? value >= 2 ** (mBits - 2) && value < 2 ** (mBits - 1) : value >= -(2 ** (mBits - 1)) && value < -(2 ** (mBits - 2)); }

export interface FloatStep {
  readonly id: string;
  readonly title: Localized;
  readonly action: Localized;
  readonly why: Localized;
  readonly mantissa: string;
  readonly exponent: string;
  readonly equation: string;
  readonly highlight: "mantissa" | "exponent" | "both" | "sign" | "none";
  readonly binaryBefore?: string;
  readonly binaryAfter?: string;
  /** Positive means moving the point left; negative means moving it right. */
  readonly pointShift?: number;
}
export interface FloatTrace {
  readonly input: string;
  readonly status: "exact" | "zero" | "cannot-normalise";
  readonly mBits: number;
  readonly eBits: number;
  readonly value: string;
  readonly mantissa: string;
  readonly exponent: string;
  readonly steps: readonly FloatStep[];
}
const frame = (id: string, title: Localized, action: Localized, why: Localized, mantissa: string, exponent: string, equation: string, highlight: FloatStep["highlight"]): FloatStep => ({ id, title, action, why, mantissa, exponent, equation, highlight });

function exactEncoding(value: Rational, mBits: number, eBits: number): { q: number; e: number } | null {
  if (!value.n) return { q: 0, e: 0 };
  const bounds = exponentBounds(eBits);
  for (let e = bounds.min; e <= bounds.max; e++) {
    const scaled = multiply(divide(value, power2(e)), rational(2n ** BigInt(mBits - 1)));
    if (scaled.d === 1n && normalisedInteger(Number(scaled.n), mBits)) return { q: Number(scaled.n), e };
  }
  return null;
}

export function conversionTrace(input: string, mode: "encode" | "decode" = "encode", mBits = 8, eBits = 4): FloatTrace {
  validateWidths(mBits, eBits);
  const value = parseDecimal(input); const encoding = exactEncoding(value, mBits, eBits);
  if (!encoding) throw new Error("This example is not exactly representable in this normalised format. Explore the approximation lesson for rounding and range limits.");
  const { q, e } = encoding; const mantissa = bitString(q, mBits); const exponent = bitString(e, eBits); const v = valueText(value); const scale = 2 ** (mBits - 1);
  let steps: FloatStep[];
  if (!value.n) {
    steps = [frame("zero", L("Zero is a special case", "Số 0 là trường hợp riêng"), L("Store an all-zero mantissa and choose exponent zero.", "Lưu mantissa toàn bit 0 và chọn exponent bằng 0."), L("No shift can give zero a non-zero leading digit. Do not apply the non-zero normalisation test.", "Dịch bao nhiêu lần cũng không tạo bit đầu khác 0. Không áp dụng quy tắc chuẩn hóa số khác 0."), mantissa, exponent, "0 × 2⁰ = 0", "both"), frame("verify", L("Check the value", "Kiểm tra giá trị"), L("Decode the stored zero.", "Giải mã số 0 đã lưu."), L("This lesson uses a canonical zero exponent; it is a convention, not a claim that other exponents change a zero mantissa.", "Bài học chọn exponent 0 làm quy ước; exponent khác cũng không làm thay đổi giá trị của mantissa 0."), mantissa, exponent, "0 = 0", "none")];
  } else if (mode === "decode") {
    const mValue = valueText(rational(BigInt(q), BigInt(scale)));
    const eUnsigned = parseInt(exponent, 2);
    const mUnsigned = parseInt(mantissa, 2);
    steps = [
      frame("decode-format", L("Read the format", "Đọc định dạng"), L(`${mBits} mantissa bits, ${eBits} exponent bits; both use two’s complement.`, `${mBits} bit mantissa, ${eBits} bit exponent; cả hai dùng bù hai.`), L("The mantissa point follows its sign bit; the exponent is an integer. Their bit weights are different.", "Dấu chấm nhị phân của mantissa nằm sau bit dấu; exponent là số nguyên. Trọng số hai phần khác nhau."), mantissa, exponent, "value = M × 2ᴱ", "both"),
      frame("decode-mantissa", L("Read the signed mantissa", "Đọc mantissa có dấu"), L(`Interpret the mantissa as signed integer ${q}, then divide by ${scale}.`, `Đọc mantissa thành số nguyên có dấu ${q}, rồi chia cho ${scale}.`), L("Dividing by the fractional scale places the binary point after the sign bit.", "Chia theo thang phân số đặt dấu chấm nhị phân ngay sau bit dấu."), mantissa, exponent, `M = ${q < 0 ? `(${mUnsigned} − ${2 ** mBits})` : q}/${scale} = ${mValue}`, "mantissa"),
      frame("decode-exponent", L("Read the signed exponent", "Đọc exponent có dấu"), L(`The exponent is ${e}.`, `Exponent bằng ${e}.`), L("A leading 1 means a negative two’s-complement integer; it does not make the whole number negative.", "Bit đầu 1 biểu thị số nguyên bù hai âm; nó không làm cả số dấu phẩy động trở thành số âm."), mantissa, exponent, `E = ${e < 0 ? `${eUnsigned} − ${2 ** eBits} = ` : ""}${e}`, "exponent"),
      frame("decode-scale", L("Apply the power of two", "Nhân với lũy thừa của 2"), L("Multiply the signed mantissa by the exponent’s scale.", "Nhân mantissa có dấu với thang lũy thừa do exponent xác định."), L("A negative exponent divides by a power of two; the mantissa determines the sign of the result.", "Exponent âm tương ứng chia cho lũy thừa của 2; mantissa quyết định dấu kết quả."), mantissa, exponent, `${mValue} × 2^(${e}) = ${v}`, "both"),
      frame("decode-check", L("Check sign and size", "Kiểm tra dấu và độ lớn"), L(`The stored value is exactly ${v}.`, `Giá trị được lưu chính xác bằng ${v}.`), L("Compare the result with the sign, exponent and stated bit widths, rather than reading the whole string as one integer.", "Đối chiếu kết quả với dấu, exponent và số bit đã cho; không đọc cả chuỗi thành một số nguyên."), mantissa, exponent, `${q}/${scale} × 2^(${e}) = ${v}`, "none"),
    ];
  } else {
    const negative = value.n < 0n; const magnitude = absolute(value); let positiveExponent = e;
    if (negative && q === -scale) positiveExponent = e + 1;
    const magnitudeInteger = multiply(divide(magnitude, power2(positiveExponent)), rational(BigInt(scale)));
    const positiveQ = Number(magnitudeInteger.n / magnitudeInteger.d);
    const positiveBits = bitString(positiveQ, mBits);
    const bounds = exponentBounds(eBits);
    const intermediateE = positiveExponent >= bounds.min && positiveExponent <= bounds.max ? bitString(positiveExponent, eBits) : "";
    const positiveM = valueText(rational(BigInt(positiveQ), BigInt(scale)));
    const negativeBits = bitString(-positiveQ, mBits);
    steps = [
      frame("magnitude", L("Write the magnitude in binary", "Viết độ lớn ở dạng nhị phân"), L(`Separate the sign and express ${valueText(magnitude)} using binary place values.`, `Tách dấu và biểu diễn ${valueText(magnitude)} bằng các trọng số nhị phân.`), L("First establish the magnitude; the sign is handled explicitly in later steps.", "Trước hết xác định độ lớn; dấu được xử lý rõ ở các bước sau."), "", "", `${valueText(magnitude)}₁₀ = ${binaryMagnitude(magnitude)}₂`, "none"),
      frame("scale", L("Choose a scale", "Chọn thang biểu diễn"), L(`Write the positive magnitude as a fraction times 2^(${positiveExponent}).`, `Viết độ lớn dương thành phân số nhân với 2^(${positiveExponent}).`), L("Moving the point and compensating with the exponent must preserve the original value.", "Dịch dấu chấm và điều chỉnh exponent để bù phải giữ nguyên giá trị ban đầu."), "", intermediateE, `${valueText(magnitude)} = ${positiveM} × 2^(${positiveExponent})`, "exponent"),
      frame("pad", L("Fill the mantissa field", "Điền đủ trường mantissa"), L(`Use exactly ${mBits} bits, adding zeros on the right when needed.`, `Dùng đúng ${mBits} bit, thêm 0 ở bên phải khi cần.`), L("The sign position has weight −1 and the following bits have weights 1/2, 1/4, and so on.", "Vị trí dấu có trọng số −1; các bit tiếp theo có trọng số 1/2, 1/4, …"), positiveBits, intermediateE, `M⁺ = ${positiveQ}/${scale} = ${positiveM}`, "mantissa"),
    ];
    if (negative) {
      const inverted = positiveBits.replace(/[01]/g, bit => bit === "0" ? "1" : "0");
      steps.push(frame("invert", L("Invert the mantissa bits", "Đảo các bit mantissa"), L("Invert every mantissa bit, including the sign bit.", "Đảo tất cả bit mantissa, kể cả bit dấu."), L("This is the first part of two’s-complement negation. Keep the exponent unchanged; inversion alone is not the final negative value.", "Đây là phần đầu của phép đổi dấu bù hai. Giữ nguyên exponent; chỉ đảo bit chưa tạo ra giá trị âm cuối cùng."), inverted, intermediateE, `${positiveBits} → ${inverted}`, "mantissa"));
      steps.push(frame("add-one", L("Add one to complete negation", "Cộng 1 để hoàn tất đổi dấu"), L("Add one in the mantissa field only.", "Chỉ cộng 1 trong trường mantissa."), L("Two’s complement means invert and add one. Negating the exponent would change the scale, not the sign of the number.", "Bù hai là đảo bit rồi cộng 1. Đổi dấu exponent sẽ đổi thang giá trị, không phải dấu của số."), negativeBits, intermediateE, `${inverted} + 1 = ${negativeBits}`, "mantissa"));
    }
    const shifted = negative && negativeBits !== mantissa;
    steps.push(frame("normalised", L("Check normalisation", "Kiểm tra chuẩn hóa"), shifted ? L("Shift the signed mantissa left once and decrease the exponent by one.", "Dịch trái mantissa có dấu một vị trí và giảm exponent đi 1.") : L("For this non-zero value, the first two mantissa bits differ.", "Với số khác 0 này, hai bit đầu mantissa khác nhau."), L("Normalised positive mantissas start 01; negative mantissas start 10. A shift must be balanced by the exponent to preserve the value.", "Mantissa dương chuẩn hóa bắt đầu bằng 01; mantissa âm bắt đầu bằng 10. Phải điều chỉnh exponent để bù phép dịch và giữ nguyên giá trị."), mantissa, exponent, shifted ? `(${-positiveQ}/${scale}) × 2^(${positiveExponent}) → (${q}/${scale}) × 2^(${e}) = ${v}` : `${mantissa.slice(0, 2)} · M × 2^(${e})`, shifted ? "both" : "sign"));
    steps.push(frame("verify", L("Decode to check your answer", "Giải mã ngược để kiểm tra"), L("Read both fields back using their signed values.", "Đọc ngược cả hai trường theo giá trị có dấu của chúng."), L("The decoded value must equal the starting value exactly; checking the bit pattern alone is insufficient.", "Giá trị giải mã phải đúng bằng giá trị ban đầu; chỉ nhìn mẫu bit chưa đủ để kiểm tra."), mantissa, exponent, `${q}/${scale} × 2^(${e}) = ${v}`, "both"));
    steps[0] = { ...steps[0], binaryAfter: binaryMagnitude(magnitude) };
    steps[1] = { ...steps[1], binaryBefore: binaryMagnitude(magnitude), binaryAfter: `0.${positiveBits.slice(1).replace(/0+$/, "")}`, pointShift: positiveExponent };
  }
  return { input, status: value.n ? "exact" : "zero", mBits, eBits, value: v, mantissa, exponent, steps };
}

export function normalisationTrace(mantissaBits: string, exponentBits: string): FloatTrace {
  validateWidths(mantissaBits.length, exponentBits.length);
  let q = signed(mantissaBits); let e = signed(exponentBits); const mBits = mantissaBits.length; const eBits = exponentBits.length;
  const original = decode(mantissaBits, exponentBits); const v = valueText(original); const steps: FloatStep[] = [];
  const snapshot = (id: string, title: Localized, action: Localized, why: Localized) => frame(id, title, action, why, bitString(q, mBits), bitString(e, eBits), `${q}/${2 ** (mBits - 1)} × 2^(${e}) = ${v}`, "both");
  steps.push(snapshot("start", L("Read the starting value", "Đọc giá trị ban đầu"), L("Decode the fields before changing them.", "Giải mã các trường trước khi thay đổi."), L("Keep this value as an invariant: every valid shift must leave it unchanged.", "Giữ giá trị này làm bất biến: mỗi phép dịch hợp lệ phải giữ nguyên nó.")));
  if (!q) {
    e = 0;
    steps.push(snapshot("zero", L("Handle zero separately", "Xử lý số 0 riêng"), L("Use the all-zero representation in this lesson.", "Dùng biểu diễn toàn bit 0 theo quy ước của bài."), L("Zero cannot satisfy the leading 01/10 test for non-zero normalised mantissas.", "Số 0 không thể thỏa điều kiện 01/10 dành cho mantissa khác 0 đã chuẩn hóa.")));
    return { input: `${mantissaBits}/${exponentBits}`, status: "zero", mBits, eBits, value: v, mantissa: bitString(q, mBits), exponent: bitString(e, eBits), steps };
  }
  const minimum = exponentBounds(eBits).min; let count = 0;
  while (!normalisedInteger(q, mBits) && e > minimum) {
    q *= 2; e--; count++;
    steps.push(snapshot(`shift-${count}`, L(`Shift ${count}`, `Lần dịch ${count}`), L("Shift the signed mantissa left by one; subtract one from the exponent.", "Dịch trái mantissa có dấu một bit; trừ exponent đi 1."), L("Doubling the mantissa and halving the scale cancel each other, preserving M × 2ᴱ.", "Nhân đôi mantissa và chia đôi thang giá trị bù nhau, nên M × 2ᴱ không đổi.")));
  }
  const success = normalisedInteger(q, mBits);
  steps.push(snapshot(success ? "verify" : "limit", success ? L("Verify normalisation", "Xác nhận chuẩn hóa") : L("Exponent limit reached", "Đã tới giới hạn exponent"), success ? L("The leading bits differ and the value is unchanged.", "Hai bit đầu khác nhau và giá trị không đổi.") : L("Stop: another shift would require an exponent below the format’s minimum.", "Dừng: dịch tiếp sẽ cần exponent nhỏ hơn giá trị tối thiểu của định dạng."), success ? L("Check both conditions; a normalised-looking pattern with a changed value is wrong.", "Kiểm cả hai điều kiện; mẫu bit trông chuẩn hóa nhưng làm đổi giá trị vẫn sai.") : L("Do not wrap the exponent bits. The input cannot be normalised within this format; denormalised formats are outside this model.", "Không cho exponent quay vòng bit. Đầu vào này không thể chuẩn hóa trong định dạng đã cho; mô hình không hỗ trợ định dạng số không chuẩn hóa.")));
  return { input: `${mantissaBits}/${exponentBits}`, status: success ? "exact" : "cannot-normalise", mBits, eBits, value: v, mantissa: bitString(q, mBits), exponent: bitString(e, eBits), steps };
}

export interface RangeResult {
  readonly mBits: number; readonly eBits: number; readonly exponentMin: number; readonly exponentMax: number;
  readonly maximumPositive: string; readonly minimumPositive: string; readonly mostNegative: string; readonly negativeClosestToZero: string;
  readonly positiveMaxBits: string; readonly positiveMinBits: string; readonly negativeMinBits: string; readonly negativeClosestBits: string;
  readonly spacingAtExponentZero: string; readonly sampleValues: readonly string[];
}
export function floatingRange(mBits: number, eBits: number): RangeResult {
  validateWidths(mBits, eBits); const { min, max } = exponentBounds(eBits); const scale = 2 ** (mBits - 1); const half = scale / 2;
  const scaled = (q: number, e: number) => multiply(rational(BigInt(q), BigInt(scale)), power2(e));
  return { mBits, eBits, exponentMin: min, exponentMax: max,
    maximumPositive: valueText(scaled(scale - 1, max)), minimumPositive: valueText(scaled(half, min)), mostNegative: valueText(scaled(-scale, max)), negativeClosestToZero: valueText(scaled(-half - 1, min)),
    positiveMaxBits: `${bitString(scale - 1, mBits)} / ${bitString(max, eBits)}`, positiveMinBits: `${bitString(half, mBits)} / ${bitString(min, eBits)}`, negativeMinBits: `${bitString(-scale, mBits)} / ${bitString(max, eBits)}`, negativeClosestBits: `${bitString(-half - 1, mBits)} / ${bitString(min, eBits)}`,
    spacingAtExponentZero: valueText(rational(1n, BigInt(scale))), sampleValues: Array.from({ length: Math.min(5, half) }, (_, i) => valueText(scaled(half + i, 0))) };
}

export interface ApproxResult {
  readonly input: string; readonly mBits: number; readonly eBits: number; readonly policy: "truncate" | "nearest";
  readonly status: "exact" | "rounded" | "overflow" | "underflow"; readonly mantissa: string; readonly exponent: string;
  readonly represented: string | null; readonly error: string | null; readonly absoluteError: string | null;
  readonly lower: string | null; readonly upper: string | null; readonly explanation: Localized; readonly steps: readonly { id: string; equation: string; why: Localized }[];
  /** Magnitude before quantisation; negative signs are restored by the declared policy. */
  readonly bitLoss?: { readonly originalBinary: string; readonly normalisedBinary: string; readonly exponent: number; readonly keptBits: string; readonly discardedBits: string; readonly repeats: boolean; readonly increment: boolean };
}
export function approximation(input: string, mBits: number, eBits: number, policy: "truncate" | "nearest"): ApproxResult {
  validateWidths(mBits, eBits); const value = parseDecimal(input); const { min, max } = exponentBounds(eBits); const scale = 2 ** (mBits - 1); const magnitude = absolute(value); const sign = value.n < 0n ? -1 : 1;
  const largest = multiply(rational(BigInt(sign < 0 ? scale : scale - 1), BigInt(scale)), power2(max));
  const smallest = multiply(rational(BigInt(sign < 0 ? scale / 2 + 1 : scale / 2), BigInt(scale)), power2(min));
  const failure = (status: "overflow" | "underflow"): ApproxResult => ({ input, mBits, eBits, policy, status, mantissa: "", exponent: "", represented: null, error: null, absoluteError: null, lower: null, upper: null,
    explanation: status === "overflow" ? L("The magnitude exceeds the largest value of this sign in the stated normalised format. Do not invent a wrapped bit pattern.", "Độ lớn vượt giá trị lớn nhất theo dấu này trong định dạng chuẩn hóa đã cho. Không tạo mẫu bit quay vòng giả.") : L("The non-zero magnitude is smaller than the closest-to-zero normalised value of this sign. This model reports underflow; it does not silently flush to zero.", "Độ lớn khác 0 nhỏ hơn giá trị chuẩn hóa gần 0 nhất theo dấu này. Mô hình báo underflow, không âm thầm đổi thành 0."), steps: [{ id: "range", equation: `${valueText(smallest)} ≤ |x| ≤ ${valueText(largest)}`, why: L("Range is checked before precision. The rule for handling out-of-range values is a separate format policy.", "Kiểm phạm vi trước độ chính xác. Cách xử lý số ngoài phạm vi là chính sách riêng của định dạng.") }] });
  if (value.n && compare(magnitude, largest) > 0) return failure("overflow");
  if (value.n && compare(magnitude, smallest) < 0) return failure("underflow");
  const exact = exactEncoding(value, mBits, eBits);
  if (exact) {
    const represented = valueText(value);
    return { input, mBits, eBits, policy, status: "exact", mantissa: bitString(exact.q, mBits), exponent: bitString(exact.e, eBits), represented, error: "0", absoluteError: "0", lower: represented, upper: represented, explanation: L("This value is exactly representable; rounding makes no change.", "Giá trị này biểu diễn chính xác được; làm tròn không làm thay đổi nó."), steps: [{ id: "exact", equation: `${exact.q}/${scale} × 2^(${exact.e}) = ${represented}`, why: L("No information is lost for this input in this format.", "Với đầu vào và định dạng này, không mất thông tin.") }] };
  }
  let exponent = min;
  while (exponent < max && compare(divide(magnitude, power2(exponent)), rational(1n)) >= 0) exponent++;
  const scaled = multiply(divide(magnitude, power2(exponent)), rational(BigInt(scale)));
  const integer = scaled.n / scaled.d; const remainder = scaled.n % scaled.d;
  const rounded = policy === "nearest" && remainder * 2n >= scaled.d ? integer + 1n : integer;
  let q = Number(rounded) * sign;
  if (q === scale) { q /= 2; exponent++; }
  if (q === -scale / 2 && exponent > min) { q *= 2; exponent--; }
  if (exponent > max) return failure("overflow");
  if (!normalisedInteger(q, mBits)) return failure("underflow");
  const represented = multiply(rational(BigInt(q), BigInt(scale)), power2(exponent)); const error = subtract(represented, value);
  // Neighbour labels use the quantisation exponent before any carry/renormalisation.
  let gridExponent = min; while (gridExponent < max && compare(divide(magnitude, power2(gridExponent)), rational(1n)) >= 0) gridExponent++;
  const left = multiply(rational(integer, BigInt(scale)), power2(gridExponent)); const right = multiply(rational(integer + 1n, BigInt(scale)), power2(gridExponent));
  const lower = sign > 0 ? left : multiply(right, rational(-1n)); const upper = sign > 0 ? right : multiply(left, rational(-1n));
  const originalBinary = binaryExpansion(magnitude); const normalisedBinary = binaryExpansion(divide(magnitude, power2(gridExponent)));
  const discardedBinary = binaryExpansion(rational(remainder, scaled.d));
  return { input, mBits, eBits, policy, status: "rounded", mantissa: bitString(q, mBits), exponent: bitString(exponent, eBits), represented: valueText(represented), error: valueText(error), absoluteError: valueText(absolute(error)), lower: valueText(lower), upper: valueText(upper),
    bitLoss: { originalBinary: originalBinary.text, normalisedBinary: normalisedBinary.text, exponent: gridExponent, keptBits: integer.toString(2).padStart(mBits - 1, "0"), discardedBits: discardedBinary.text.slice(2), repeats: originalBinary.repeats || normalisedBinary.repeats || discardedBinary.repeats, increment: rounded > integer },
    explanation: policy === "truncate" ? L("Truncate towards zero. For a negative input, apply the rule to its magnitude, then restore the sign; do not simply cut a two’s-complement bit string.", "Cắt về phía 0. Với số âm, áp dụng quy tắc cho độ lớn rồi trả lại dấu; không chỉ cắt chuỗi bit bù hai.") : L("Round to the nearest representable value; exact ties go away from zero in this demonstration.", "Làm tròn tới giá trị biểu diễn gần nhất; trường hợp đúng giữa hai giá trị được chọn xa 0 hơn trong minh họa này."),
    steps: [
      { id: "scale", equation: `|x| × 2^(${mBits - 1 - gridExponent}) = ${valueText(scaled)}`, why: L("Express the magnitude in units of one stored mantissa step.", "Đổi độ lớn sang đơn vị một bước mantissa được lưu.") },
      { id: "choose", equation: `${valueText(lower)} ≤ ${valueText(value)} ≤ ${valueText(upper)} → ${valueText(represented)}`, why: L("Apply the stated rule to these neighbouring representable values.", "Áp dụng quy tắc đã nêu cho các giá trị biểu diễn lân cận này.") },
      { id: "error", equation: `${valueText(represented)} − ${valueText(value)} = ${valueText(error)}`, why: L("Signed error is stored value minus original value; absolute error measures its magnitude.", "Sai số có dấu là giá trị lưu trừ giá trị ban đầu; sai số tuyệt đối là độ lớn sai số.") },
    ] };
}

export interface HashStep { readonly id: string; readonly index: number; readonly table: readonly (number | null)[]; readonly action: Localized; readonly why: Localized; readonly outcome: "probe" | "found" | "inserted" | "missing" | "full" | "duplicate"; }
export interface HashTrace { readonly keys: readonly number[]; readonly key: number; readonly operation: "insert" | "lookup"; readonly size: number; readonly address: number; readonly steps: readonly HashStep[]; readonly table: readonly (number | null)[]; readonly outcome: HashStep["outcome"]; }
export function hashAddress(key: number, size = 7): number { if (!Number.isSafeInteger(key) || key < 0 || !Number.isInteger(size) || size < 2 || size > 20) throw new Error("Use a non-negative integer key and 2–20 slots."); return key % size; }
export function hashTrace(keys: readonly number[], key: number, operation: "insert" | "lookup", size = 7): HashTrace {
  const address = hashAddress(key, size); const table: (number | null)[] = Array(size).fill(null);
  for (const stored of keys) {
    const start = hashAddress(stored, size); let placed = false;
    for (let probe = 0; probe < size; probe++) { const i = (start + probe) % size; if (table[i] === stored) { placed = true; break; } if (table[i] === null) { table[i] = stored; placed = true; break; } }
    if (!placed) throw new Error("The starting keys exceed this table’s capacity.");
  }
  const steps: HashStep[] = []; let outcome: HashStep["outcome"] = "probe";
  for (let probe = 0; probe < size; probe++) {
    const index = (address + probe) % size; const stored = table[index];
    let action: Localized; let why: Localized;
    if (stored === key) { outcome = operation === "lookup" ? "found" : "duplicate"; action = L(`Slot ${index} contains key ${key}.`, `Ô ${index} chứa khóa ${key}.`); why = operation === "lookup" ? L("The stored key matches: retrieval succeeds.", "Khóa lưu khớp với khóa cần tìm: truy xuất thành công.") : L("This key already exists; do not insert a duplicate or overwrite its record.", "Khóa này đã tồn tại; không chèn bản sao hoặc ghi đè record."); }
    else if (stored === null) { outcome = operation === "lookup" ? "missing" : "inserted"; if (operation === "insert") table[index] = key; action = operation === "lookup" ? L(`Slot ${index} is empty: stop.`, `Ô ${index} trống: dừng.`) : L(`Store key ${key} in empty slot ${index}.`, `Lưu khóa ${key} vào ô trống ${index}.`); why = operation === "lookup" ? L("With this insertion policy and no deletion, the first empty slot proves the key is absent.", "Với chính sách chèn này và không xóa, ô trống đầu tiên chứng minh khóa không có trong bảng.") : L("Insertion and later lookup follow the same probe sequence.", "Chèn và tìm lại về sau phải đi cùng chuỗi dò."); }
    else { outcome = "probe"; action = L(`Slot ${index} holds ${stored}, not ${key}.`, `Ô ${index} chứa ${stored}, không phải ${key}.`); why = L(`Compare the key, then probe slot ${(index + 1) % size}; wrap from the last slot to zero.`, `So sánh khóa rồi dò ô ${(index + 1) % size}; từ ô cuối quay về ô 0.`); }
    steps.push({ id: `probe-${probe}`, index, table: [...table], action, why, outcome });
    if (outcome !== "probe") break;
  }
  if (outcome === "probe") {
    outcome = operation === "lookup" ? "missing" : "full";
    steps.push({ id: "bounded-stop", index: -1, table: [...table], outcome, action: L(`All ${size} slots have been checked.`, `Đã kiểm tra đủ ${size} ô.`), why: L(operation === "lookup" ? "The key is absent. Stop rather than loop forever." : "The table is full. Report failure without overwriting an existing key.", operation === "lookup" ? "Khóa không có. Dừng thay vì lặp vô hạn." : "Bảng đã đầy. Báo không thể chèn, không ghi đè khóa hiện có.") });
  }
  return { keys, key, operation, size, address, steps, table, outcome };
}

export function setResult(a: readonly string[], b: readonly string[], operation: "union" | "intersection" | "difference"): string[] { const left = new Set(a); const right = new Set(b); return [...(operation === "union" ? new Set([...left, ...right]) : [...left].filter(value => operation === "intersection" ? right.has(value) : !right.has(value)))].sort(); }

/** Exact helper exposed for independent fixtures, not a browser floating-point oracle. */
export function decodeFloating(mantissa: string, exponent: string): string { validateWidths(mantissa.length, exponent.length); return valueText(decode(mantissa, exponent)); }

export type FileOrganisation = "serial" | "sequential" | "random";
export type FileAccess = "sequential" | "direct";
export type FileTask = "read-all" | "find18" | "find20" | "insert22";
export interface FileStep {
  readonly id: string; readonly title: Localized; readonly action: Localized; readonly why: Localized;
  readonly table: readonly (number | null)[]; readonly active: number; readonly visited: readonly number[];
  readonly output: readonly number[]; readonly outcome: "ready" | "scan" | "found" | "missing" | "read" | "inserted" | "unsupported";
}
export interface FileTrace { readonly organisation: FileOrganisation; readonly access: FileAccess; readonly task: FileTask; readonly steps: readonly FileStep[]; readonly supported: boolean; }
export const fileArrivalKeys = [25, 12, 31, 18] as const;

/** Fixed, declared teaching workload. Arrays are snapshots, not mutable DOM state. */
export function fileOrganisationTrace(organisation: FileOrganisation, access: FileAccess, task: FileTask): FileTrace {
  if (!["serial", "sequential", "random"].includes(organisation) || !["sequential", "direct"].includes(access) || !["read-all", "find18", "find20", "insert22"].includes(task)) throw new Error("Unsupported file scenario.");
  const table: (number | null)[] = organisation === "random" ? [...hashTrace(fileArrivalKeys, 0, "lookup").table] : organisation === "sequential" ? [...fileArrivalKeys].sort((a, b) => a - b) : [...fileArrivalKeys];
  const steps: FileStep[] = [];
  const push = (id: string, title: Localized, action: Localized, why: Localized, active = -1, visited: readonly number[] = [], output: readonly number[] = [], outcome: FileStep["outcome"] = "scan", snapshot = table) => steps.push({ id, title, action, why, active, visited: [...visited], output: [...output], outcome, table: [...snapshot] });
  push("layouts", L("Inspect the storage layout", "Quan sát cách lưu"), L(`Arrival order: ${fileArrivalKeys.join(" → ")}. Organisation: ${organisation}.`, `Thứ tự đến: ${fileArrivalKeys.join(" → ")}. Tổ chức: ${organisation}.`), organisation === "serial" ? L("Serial keeps arrival order; a larger key is not proof that later keys are larger.", "Serial giữ thứ tự đến; gặp khóa lớn không chứng minh các khóa sau cũng lớn.") : organisation === "sequential" ? L("Sequential keeps ascending keys. An index, if selected, is a separate access mechanism.", "Sequential giữ khóa tăng dần. Chỉ mục, nếu được chọn, là cơ chế truy cập riêng.") : L("MOD 7 and linear probing place these keys; random organisation does not mean a random shuffle.", "MOD 7 và dò tuyến tính đặt các khóa; tổ chức random không có nghĩa xáo trộn ngẫu nhiên."), -1, [], [], "ready");
  const unsupported = organisation === "serial" && access === "direct" ? L("This serial example has no key-to-position index. Choose sequential access; do not guess a location from an unsorted key.", "Ví dụ serial này không có chỉ mục khóa–vị trí. Chọn truy cập tuần tự; không đoán vị trí từ khóa chưa sắp xếp.") : task === "read-all" && access === "direct" ? L("One direct lookup retrieves one key. To read every record in this model, choose sequential access and inspect the occupied positions.", "Một lần truy cập trực tiếp tìm một khóa. Để đọc mọi bản ghi trong mô hình này, chọn truy cập tuần tự và xét các vị trí có dữ liệu.") : organisation === "random" && access === "sequential" && task !== "read-all" ? L("This keyed random-file demonstration uses direct access through MOD 7 and probing. Select direct access to follow that mechanism.", "Minh họa tệp random theo khóa này dùng truy cập trực tiếp qua MOD 7 và dò. Chọn truy cập trực tiếp để theo cơ chế đó.") : organisation === "sequential" && access === "direct" && task === "insert22" ? L("An index locates a record but does not insert space in an ordered file. Select sequential access to observe the declared reorganisation example.", "Chỉ mục định vị bản ghi nhưng không tự tạo chỗ trong tệp có thứ tự. Chọn truy cập tuần tự để xem ví dụ tổ chức lại đã nêu.") : null;
  if (unsupported) {
    push("unsupported", L("Choose a supported access path", "Chọn đường truy cập được hỗ trợ"), unsupported, L("The layout is unchanged. This is a limit of the declared model, not a claim that all other systems forbid the operation.", "Bố trí giữ nguyên. Đây là giới hạn mô hình đã nêu, không phải khẳng định mọi hệ thống đều cấm thao tác."), -1, [], [], "unsupported");
    return { organisation, access, task, steps, supported: false };
  }
  if (task === "read-all") {
    const output: number[] = []; const visited: number[] = [];
    table.forEach((key, index) => { visited.push(index); if (key !== null) output.push(key); push(`read-${index}`, L(`Inspect position ${organisation === "random" ? index : index + 1}`, `Xét vị trí ${organisation === "random" ? index : index + 1}`), key === null ? L("This slot is empty; no record is output.", "Ô trống; không xuất bản ghi.") : L(`Read the record with key ${key}.`, `Đọc bản ghi có khóa ${key}.`), L("The read follows storage positions. It does not silently sort the output.", "Lượt đọc đi theo vị trí lưu. Nó không tự sắp xếp kết quả."), index, visited, output, key === null ? "scan" : "read"); });
    return { organisation, access, task, steps, supported: true };
  }
  const target = task === "find18" ? 18 : task === "find20" ? 20 : 22;
  if (organisation === "random") {
    const trace = hashTrace(fileArrivalKeys, target, task === "insert22" ? "insert" : "lookup");
    push("home", L("Calculate the home slot", "Tính ô gốc"), L(`${target} MOD 7 = ${trace.address}.`, `${target} MOD 7 = ${trace.address}.`), L("The hash selects the first candidate; compare keys and probe if necessary.", "Hash chọn ứng viên đầu; so sánh khóa rồi dò nếu cần."));
    const visited: number[] = [];
    trace.steps.forEach(step => { if (step.index >= 0) visited.push(step.index); push(step.id, L(step.index >= 0 ? `Inspect slot ${step.index}` : "Stop", step.index >= 0 ? `Xét ô ${step.index}` : "Dừng"), step.action, step.why, step.index, visited, step.outcome === "found" ? [target] : [], step.outcome === "found" ? "found" : step.outcome === "inserted" ? "inserted" : step.outcome === "missing" ? "missing" : "scan", [...step.table]); });
    return { organisation, access, task, steps, supported: true };
  }
  if (task === "insert22") {
    const insertion = organisation === "serial" ? table.length : table.findIndex(key => key! > target);
    const position = insertion < 0 ? table.length : insertion;
    push("prepare-insertion", L("Choose where the new key belongs", "Chọn vị trí cho khóa mới"), L(organisation === "serial" ? "Append 22 after the existing records." : "22 belongs between 18 and 25.", organisation === "serial" ? "Thêm 22 sau các bản ghi hiện có." : "22 nằm giữa 18 và 25."), L(organisation === "serial" ? "Arrival order allows appending at the end." : "The ascending-key invariant must survive the write.", organisation === "serial" ? "Thứ tự đến cho phép thêm ở cuối." : "Điều kiện khóa tăng dần phải được giữ sau khi ghi."), position < table.length ? position : -1);
    const after = [...table]; after.splice(position, 0, target);
    push("insert", L("Write the new organisation", "Ghi bố trí mới"), L(`Stored keys: ${after.join(", ")}.`, `Khóa đã lưu: ${after.join(", ")}.`), L(organisation === "serial" ? "The old records keep their positions." : "In this simplified rewrite, later records move and any index must be updated. This is not a cost-free in-place insertion.", organisation === "serial" ? "Các bản ghi cũ giữ vị trí." : "Trong mô hình ghi lại này, các bản ghi sau dịch vị trí và chỉ mục cần cập nhật. Không phải chèn tại chỗ không tốn chi phí."), position, [], [], "inserted", after);
    return { organisation, access, task, steps, supported: true };
  }
  if (access === "direct") {
    const position = table.indexOf(target);
    push("index", L("Read the provided index", "Đọc chỉ mục được cung cấp"), position < 0 ? L(`The complete index has no entry for ${target}.`, `Chỉ mục đầy đủ không có khóa ${target}.`) : L(`Index[${target}] = position ${position + 1}.`, `Index[${target}] = vị trí ${position + 1}.`), L("This model supplies a complete key-to-position index separately from the sorted file.", "Mô hình cung cấp riêng chỉ mục đầy đủ từ khóa đến vị trí, bên cạnh tệp đã sắp xếp."), -1, [], [], position < 0 ? "missing" : "scan");
    if (position >= 0) push("direct-read", L("Read and compare the record key", "Đọc và so sánh khóa bản ghi"), L(`Position ${position + 1} contains ${target}: found.`, `Vị trí ${position + 1} chứa ${target}: tìm thấy.`), L("The index selected the location; the record key confirms identity.", "Chỉ mục chọn vị trí; khóa bản ghi xác nhận đúng dữ liệu."), position, [position], [target], "found");
    return { organisation, access, task, steps, supported: true };
  }
  const visited: number[] = [];
  for (let i = 0; i < table.length; i++) {
    const key = table[i]!; visited.push(i); const found = key === target; const passed = organisation === "sequential" && key > target;
    push(`scan-${i}`, L(`Read key ${key}`, `Đọc khóa ${key}`), L(`${key} ${found ? "=" : key < target ? "<" : ">"} ${target}. ${found ? "Found." : passed ? "Stop: not found." : "Continue."}`, `${key} ${found ? "=" : key < target ? "<" : ">"} ${target}. ${found ? "Tìm thấy." : passed ? "Dừng: không có." : "Tiếp tục."}`), found ? L("The key matches, so return this record.", "Khóa khớp nên trả về bản ghi này.") : passed ? L("Keys are ascending: every later key is larger, so the target cannot follow.", "Khóa tăng dần: mọi khóa sau đều lớn hơn nên khóa cần tìm không thể ở sau.") : L(organisation === "serial" ? "The file is not key-sorted. A larger key does not justify stopping." : "The current key is smaller, so inspect the next record.", organisation === "serial" ? "Tệp không được sắp theo khóa. Gặp khóa lớn hơn không đủ lý do dừng." : "Khóa hiện tại nhỏ hơn nên xét bản ghi kế tiếp."), i, visited, found ? [target] : [], found ? "found" : passed ? "missing" : "scan");
    if (found || passed) return { organisation, access, task, steps, supported: true };
  }
  push("end", L("Reach the end of the file", "Đến cuối tệp"), L(`No record matches ${target}.`, `Không có bản ghi khớp ${target}.`), L("Every record was checked. The search now has evidence to report absence.", "Đã kiểm tra mọi bản ghi. Lúc này tìm kiếm đủ bằng chứng để kết luận không có."), -1, visited, [], "missing");
  return { organisation, access, task, steps, supported: true };
}
