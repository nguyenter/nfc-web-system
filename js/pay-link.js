import { findBank } from "./banks.js";

/**
 * Payload chuyển khoản lưu trên thẻ (qua URL pay.html).
 * @typedef {{ bin: string, acc: string, name: string, amount?: string, memo?: string }} PayPayload
 */

/** Bỏ dấu tiếng Việt để nội dung CK / tên hiển thị gọn trên QR */
export function stripVietnamese(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function normalizeAccountName(name) {
  return stripVietnamese(name).toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeMemo(memo) {
  return stripVietnamese(memo).replace(/[^A-Za-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * @param {PayPayload} payload
 * @param {string} [baseHref]
 */
export function buildPayUrl(payload, baseHref = location.href) {
  const bank = findBank(payload.bin);
  if (!bank) throw new Error("Chưa chọn ngân hàng hợp lệ.");
  const acc = String(payload.acc || "").replace(/\s+/g, "");
  if (!acc || acc.length < 6) throw new Error("Số tài khoản không hợp lệ.");
  const name = normalizeAccountName(payload.name);
  if (!name || name.length < 5) throw new Error("Tên chủ tài khoản tối thiểu 5 ký tự (không dấu).");

  const url = new URL("pay.html", baseHref);
  url.search = "";
  url.hash = "";
  url.searchParams.set("b", bank.bin);
  url.searchParams.set("a", acc);
  url.searchParams.set("n", name);
  if (payload.amount) {
    const amount = String(payload.amount).replace(/\D/g, "");
    if (amount) url.searchParams.set("m", amount);
  }
  if (payload.memo) {
    const memo = normalizeMemo(payload.memo);
    if (memo) url.searchParams.set("c", memo);
  }
  return url.toString();
}

/** @returns {PayPayload | null} */
export function parsePayUrl(href = location.href) {
  const url = new URL(href);
  const bin = url.searchParams.get("b");
  const acc = url.searchParams.get("a");
  const name = url.searchParams.get("n");
  if (!bin || !acc || !name) return null;
  return {
    bin,
    acc,
    name,
    amount: url.searchParams.get("m") || "",
    memo: url.searchParams.get("c") || "",
  };
}

/** Ảnh VietQR (không cần backend) — dùng khi người nhận muốn quét trên màn hình */
export function buildVietQrImageUrl(payload) {
  const bank = findBank(payload.bin);
  if (!bank) return "";
  const acc = String(payload.acc || "").replace(/\s+/g, "");
  const base = `https://img.vietqr.io/image/${bank.bin}-${acc}-compact2.png`;
  const q = new URLSearchParams();
  if (payload.amount) q.set("amount", String(payload.amount).replace(/\D/g, ""));
  if (payload.memo) q.set("addInfo", normalizeMemo(payload.memo));
  if (payload.name) q.set("accountName", normalizeAccountName(payload.name));
  const qs = q.toString();
  return qs ? `${base}?${qs}` : base;
}

export function formatMoney(amount) {
  const n = String(amount || "").replace(/\D/g, "");
  if (!n) return "";
  return Number(n).toLocaleString("vi-VN") + " đ";
}

export function estimateNdefUrlBytes(url) {
  // Ước lượng payload NDEF URL (không gồm overhead header ~5–8 byte)
  return new TextEncoder().encode(url).length;
}
