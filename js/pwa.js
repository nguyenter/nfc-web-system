/**
 * Đăng ký service worker + nút "Cài app" (Chrome Android).
 */

const INSTALL_BTN_ID = "btnInstall";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* ignore — local file:// hoặc SW bị chặn */
    });
  });
}

export function setupInstallButton() {
  const btn = document.getElementById(INSTALL_BTN_ID);
  if (!btn) return;

  if (isStandalone()) {
    btn.hidden = true;
    return;
  }

  let deferred = null;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    btn.hidden = false;
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    btn.hidden = true;
  });

  btn.addEventListener("click", async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice.catch(() => {});
      deferred = null;
      btn.hidden = true;
      return;
    }
    // Fallback: hướng dẫn thủ công (Chrome chưa bắn beforeinstallprompt)
    alert(
      "Trên Chrome Android:\n1) Mở menu ⋮\n2) Chọn \"Cài đặt ứng dụng\" hoặc \"Thêm vào màn hình chính\"."
    );
  });

  // Hiện nút hướng dẫn nếu chưa có prompt (vẫn hữu ích trên README flow)
  if (!isStandalone()) {
    // Để người dùng luôn thấy cách cài; ẩn khi đã cài
    btn.hidden = false;
  }
}
