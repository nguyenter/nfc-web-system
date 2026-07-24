import { BANKS, findBank } from "./banks.js";
import {
  buildPayUrl,
  buildVietQrImageUrl,
  estimateNdefUrlBytes,
  formatMoney,
  normalizeAccountName,
} from "./pay-link.js";
import { eraseNfc, isNfcSupported, readNfc, writeUrlToNfc } from "./nfc.js";
import { registerServiceWorker, setupInstallButton } from "./pwa.js";

const els = {
  compatBadge: document.getElementById("compatBadge"),
  bank: document.getElementById("bank"),
  acc: document.getElementById("acc"),
  name: document.getElementById("name"),
  amount: document.getElementById("amount"),
  memo: document.getElementById("memo"),
  previewUrl: document.getElementById("previewUrl"),
  previewBytes: document.getElementById("previewBytes"),
  previewQr: document.getElementById("previewQr"),
  status: document.getElementById("status"),
  statusText: document.getElementById("statusText"),
  btnWrite: document.getElementById("btnWrite"),
  btnPreview: document.getElementById("btnPreview"),
  btnRead: document.getElementById("btnRead"),
  btnErase: document.getElementById("btnErase"),
  resultCard: document.getElementById("resultCard"),
  resultBody: document.getElementById("resultBody"),
};

let abortController = null;
let busy = false;

function fillBanks() {
  for (const b of BANKS) {
    const opt = document.createElement("option");
    opt.value = b.bin;
    opt.textContent = `${b.name} (${b.code})`;
    els.bank.appendChild(opt);
  }
}

function setStatus(message, kind = "") {
  els.statusText.textContent = message;
  els.status.classList.remove("is-busy", "is-ok", "is-err");
  if (kind) els.status.classList.add(kind);
}

function currentPayload() {
  return {
    bin: els.bank.value,
    acc: els.acc.value.trim(),
    name: els.name.value.trim(),
    amount: els.amount.value.trim(),
    memo: els.memo.value.trim(),
  };
}

function refreshPreview() {
  try {
    const payload = currentPayload();
    if (!payload.bin || !payload.acc || !payload.name) {
      els.previewUrl.textContent = "Điền ngân hàng, STK và tên chủ TK…";
      els.previewBytes.textContent = "";
      els.previewQr.removeAttribute("src");
      els.previewQr.hidden = true;
      return null;
    }
    const url = buildPayUrl(payload);
    const bytes = estimateNdefUrlBytes(url);
    els.previewUrl.textContent = url;
    els.previewBytes.textContent =
      bytes > 180
        ? `~${bytes} byte — hơi dài, nên dùng thẻ NTAG215/216 hoặc rút ngắn nội dung.`
        : `~${bytes} byte — phù hợp hầu hết thẻ NTAG213+.`;
    els.previewBytes.classList.toggle("is-warn", bytes > 180);
    els.previewQr.src = buildVietQrImageUrl(payload);
    els.previewQr.hidden = false;
    return url;
  } catch (err) {
    els.previewUrl.textContent = err.message || String(err);
    els.previewBytes.textContent = "";
    els.previewQr.hidden = true;
    return null;
  }
}

function setBusy(on, message) {
  busy = on;
  [els.btnWrite, els.btnRead, els.btnErase].forEach((btn) => {
    btn.disabled = on || !isNfcSupported() || !window.isSecureContext;
  });
  if (on) setStatus(message || "Đưa thẻ NFC sát mặt lưng điện thoại…", "is-busy");
}

async function runNfc(label, fn) {
  if (busy) return null;
  abortController?.abort();
  abortController = new AbortController();
  setBusy(true, `${label}: chạm thẻ vào mặt lưng…`);
  try {
    const result = await fn(abortController.signal);
    setStatus(`${label} thành công.`, "is-ok");
    els.resultCard.hidden = false;
    els.resultBody.textContent = JSON.stringify(result, null, 2);
    return result;
  } catch (err) {
    if (err?.name === "AbortError") {
      setStatus("Đã hủy.", "");
      return null;
    }
    const msg = err?.message || String(err);
    setStatus(msg, "is-err");
    els.resultCard.hidden = false;
    els.resultBody.textContent = msg;
    return null;
  } finally {
    setBusy(false);
    abortController = null;
  }
}

function initCompat() {
  const ok = isNfcSupported() && window.isSecureContext;
  if (ok) {
    els.compatBadge.textContent = "Có thể ghi NFC";
    els.compatBadge.classList.add("is-ok");
    setStatus("Điền thông tin CK → Ghi vào thẻ. Người khác chỉ cần chạm thẻ để mở link.");
    [els.btnWrite, els.btnRead, els.btnErase].forEach((b) => (b.disabled = false));
  } else if (!window.isSecureContext) {
    els.compatBadge.textContent = "Cần HTTPS";
    els.compatBadge.classList.add("is-no");
    setStatus("Ghi NFC chỉ chạy trên HTTPS hoặc localhost (Android Chrome).", "is-err");
  } else {
    els.compatBadge.textContent = "Không ghi được NFC tại đây";
    els.compatBadge.classList.add("is-no");
    setStatus(
      "Trình duyệt này không ghi NFC được. Dùng Chrome trên Android để ghi thẻ. iPhone vẫn mở được link khi chạm thẻ đã ghi.",
      "is-err"
    );
  }
}

function bind() {
  ["input", "change"].forEach((ev) => {
    els.bank.addEventListener(ev, refreshPreview);
    els.acc.addEventListener(ev, refreshPreview);
    els.name.addEventListener(ev, () => {
      const caret = els.name.selectionStart;
      const norm = normalizeAccountName(els.name.value);
      if (norm !== els.name.value) {
        els.name.value = norm;
        try {
          els.name.setSelectionRange(caret, caret);
        } catch {
          /* ignore */
        }
      }
      refreshPreview();
    });
    els.amount.addEventListener(ev, refreshPreview);
    els.memo.addEventListener(ev, refreshPreview);
  });

  els.btnPreview.addEventListener("click", () => {
    const url = refreshPreview();
    if (url) window.open(url, "_blank", "noopener");
  });

  els.btnWrite.addEventListener("click", async () => {
    let url;
    try {
      url = buildPayUrl(currentPayload());
    } catch (err) {
      setStatus(err.message || String(err), "is-err");
      return;
    }
    refreshPreview();
    const bank = findBank(currentPayload().bin);
    const ok = window.confirm(
      `Ghi link chuyển khoản lên thẻ?\n\n${bank?.name || ""} · ${currentPayload().acc}\n${currentPayload().name}` +
        (currentPayload().amount ? `\nSố tiền: ${formatMoney(currentPayload().amount)}` : "")
    );
    if (!ok) return;
    await runNfc("Ghi", (signal) => writeUrlToNfc(url, { signal }));
  });

  els.btnRead.addEventListener("click", () => runNfc("Đọc", (signal) => readNfc({ signal })));

  els.btnErase.addEventListener("click", async () => {
    if (!window.confirm("Xóa nội dung NDEF trên thẻ?")) return;
    await runNfc("Xóa", (signal) => eraseNfc({ signal }));
  });
}

registerServiceWorker();
setupInstallButton();
fillBanks();
bind();
initCompat();
refreshPreview();
