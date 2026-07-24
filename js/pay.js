import { findBank } from "./banks.js";
import { buildVietQrImageUrl, formatMoney, parsePayUrl } from "./pay-link.js";

const els = {
  empty: document.getElementById("emptyState"),
  card: document.getElementById("payCard"),
  bank: document.getElementById("payBank"),
  name: document.getElementById("payName"),
  acc: document.getElementById("payAcc"),
  amount: document.getElementById("payAmount"),
  amountRow: document.getElementById("amountRow"),
  memo: document.getElementById("payMemo"),
  memoRow: document.getElementById("memoRow"),
  qr: document.getElementById("payQr"),
  toast: document.getElementById("toast"),
};

function toast(msg) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    els.toast.hidden = true;
  }, 1800);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`Đã copy ${label}`);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast(`Đã copy ${label}`);
  }
}

function render() {
  const payload = parsePayUrl();
  if (!payload) {
    els.empty.hidden = false;
    els.card.hidden = true;
    return;
  }

  const bank = findBank(payload.bin);
  els.empty.hidden = true;
  els.card.hidden = false;

  els.bank.textContent = bank ? bank.name : payload.bin;
  els.name.textContent = payload.name;
  els.acc.textContent = payload.acc;

  if (payload.amount) {
    els.amountRow.hidden = false;
    els.amount.textContent = formatMoney(payload.amount);
  } else {
    els.amountRow.hidden = true;
  }

  if (payload.memo) {
    els.memoRow.hidden = false;
    els.memo.textContent = payload.memo;
  } else {
    els.memoRow.hidden = true;
  }

  els.qr.src = buildVietQrImageUrl(payload);
  els.qr.alt = `VietQR ${bank?.name || ""} ${payload.acc}`;
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-copy");
    const map = {
      acc: () => els.acc.textContent,
      name: () => els.name.textContent,
      amount: () => String(els.amount.textContent || "").replace(/\D/g, ""),
      memo: () => els.memo.textContent,
    };
    const labels = { acc: "số tài khoản", name: "tên", amount: "số tiền", memo: "nội dung" };
    const value = map[key]?.();
    if (value) copyText(value, labels[key] || key);
  });
});

document.getElementById("btnCopyAll")?.addEventListener("click", () => {
  const payload = parsePayUrl();
  if (!payload) return;
  const bank = findBank(payload.bin);
  const lines = [
    `Ngân hàng: ${bank?.name || payload.bin}`,
    `STK: ${payload.acc}`,
    `Tên: ${payload.name}`,
  ];
  if (payload.amount) lines.push(`Số tiền: ${formatMoney(payload.amount)}`);
  if (payload.memo) lines.push(`Nội dung: ${payload.memo}`);
  copyText(lines.join("\n"), "thông tin CK");
});

render();
