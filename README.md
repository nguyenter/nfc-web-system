# TapPay — NFC chuyển khoản (PWA)

Ghi thông tin nhận tiền vào thẻ NFC dạng **link HTTPS**. Người khác chạm thẻ → mở trang thanh toán (copy STK / VietQR), không cần đưa mã QR giấy.

---

## Tải app trên Android

> Mở bằng **Chrome** trên điện thoại Android (cần NFC nếu muốn ghi thẻ).

### [➜ Mở TapPay & Cài app](https://nguyenter.github.io/nfc-web-system/)

**Cách cài (30 giây):**

1. Bấm link trên → mở site trên Chrome Android.
2. Bấm nút **Cài app** trên trang, **hoặc** menu Chrome `⋮` → **Cài đặt ứng dụng** / **Thêm vào màn hình chính**.
3. Icon **TapPay** xuất hiện trên màn hình chính như app thường.

Sau khi cài, mở app → điền STK → **Ghi vào thẻ NFC**.

---

## Luồng dùng

1. **Cài / mở** app (link GitHub Pages ở trên — HTTPS).
2. Mở bằng **Chrome Android** (có NFC).
3. Điền ngân hàng, STK, tên → **Ghi vào thẻ NFC**.
4. Người khác (iPhone hoặc Android) **chạm thẻ** → trình duyệt mở trang thanh toán.

> iOS **không ghi** được thẻ qua web, nhưng **mở link** trên thẻ (NDEF URL) vẫn được.

## Chạy local

```bash
cd C:\Users\HP\nfc-web-system
npx --yes serve . -l 3000
```

- Ghi thẻ: `http://localhost:3000` (Android Chrome)
- Xem trang người nhận: `/pay.html?...`

**Lưu ý:** Thẻ ghi bằng `localhost` chỉ mở được trên máy đó. Muốn dùng thật → dùng [bản GitHub Pages](https://nguyenter.github.io/nfc-web-system/) rồi ghi lại thẻ.

## Giới hạn thẻ

URL nằm trong bộ nhớ thẻ. NTAG213 (~144 byte) dễ đầy; nên dùng **NTAG215/216**, rút ngắn tên/nội dung CK.

## Cấu trúc

```
index.html              # Form ghi NFC + nút Cài app
pay.html                # Trang người nhận sau khi chạm thẻ
manifest.webmanifest    # Cấu hình PWA
sw.js                   # Service worker (cache offline)
assets/icons/           # Icon app 192 / 512
js/banks.js             # Danh sách ngân hàng
js/pay-link.js          # Tạo / parse link + VietQR ảnh
js/nfc.js               # Web NFC
js/writer.js            # UI ghi thẻ
js/pay.js               # UI trang thanh toán
js/pwa.js               # Đăng ký SW + cài PWA
```
