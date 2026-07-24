/**
 * Web NFC — ghi URL / xóa NDEF (Android Chrome + HTTPS).
 */

export function isNfcSupported() {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

export async function ensurePermission() {
  if (!navigator.permissions?.query) return true;
  try {
    const status = await navigator.permissions.query({ name: "nfc" });
    return status.state !== "denied";
  } catch {
    return true;
  }
}

export async function writeUrlToNfc(url, { signal } = {}) {
  if (!isNfcSupported()) throw new Error("Cần Android Chrome có Web NFC để ghi thẻ.");
  if (!(await ensurePermission())) throw new Error("Quyền NFC bị từ chối.");
  if (!/^https?:\/\//i.test(url)) throw new Error("URL phải bắt đầu bằng http(s).");

  const writer = new NDEFReader();
  await writer.write(
    { records: [{ recordType: "url", data: url }] },
    { signal }
  );
  return { url };
}

export async function readNfc({ signal } = {}) {
  if (!isNfcSupported()) throw new Error("Cần Android Chrome có Web NFC.");
  if (!(await ensurePermission())) throw new Error("Quyền NFC bị từ chối.");

  const reader = new NDEFReader();
  await reader.scan({ signal });

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    signal?.addEventListener("abort", onAbort, { once: true });

    reader.addEventListener(
      "reading",
      (event) => {
        const decoder = new TextDecoder();
        const records = [...event.message.records].map((record) => {
          try {
            return {
              recordType: record.recordType,
              data: record.data ? decoder.decode(record.data) : null,
            };
          } catch {
            return { recordType: record.recordType, data: null };
          }
        });
        resolve({ serialNumber: event.serialNumber || null, records });
      },
      { once: true }
    );

    reader.addEventListener(
      "readingerror",
      () => reject(new Error("Không đọc được thẻ. Thử lại.")),
      { once: true }
    );
  });
}

export async function eraseNfc({ signal } = {}) {
  if (!isNfcSupported()) throw new Error("Cần Android Chrome có Web NFC.");
  if (!(await ensurePermission())) throw new Error("Quyền NFC bị từ chối.");
  const writer = new NDEFReader();
  await writer.write({ records: [{ recordType: "empty" }] }, { signal });
  return { erased: true };
}
