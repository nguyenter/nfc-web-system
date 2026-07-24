# TapPay — NFC chuyển khoản (web)

Ghi thông tin nhận tiền vào thẻ NFC dạng **link HTTPS**. Người khác chạm thẻ → mở trang thanh toán (copy STK / VietQR), không cần đưa mã QR giấy.

## Luồng dùng

1. **Deploy** site lên HTTPS (Netlify Drop / Cloudflare Pages).
2. Mở trang ghi thẻ bằng **Chrome Android** (có NFC).
3. Điền ngân hàng, STK, tên → **Ghi vào thẻ NFC**.
4. Người khác (iPhone hoặc Android) **chạm thẻ** → trình duyệt mở `pay.html` với thông tin CK.

> iOS **không ghi** được thẻ qua web, nhưng **mở link** trên thẻ (NDEF URL) vẫn được.

## Chạy local

```bash
cd C:\Users\HP\nfc-web-system
npx --yes serve . -l 3000
```

- Ghi thẻ: `http://localhost:3000` (Android Chrome)
- Xem trang người nhận: mở “Xem trang người nhận” hoặc `/pay.html?...`

**Lưu ý:** Thẻ ghi bằng `localhost` chỉ mở được trên máy đó. Muốn dùng thật ngoài đời → deploy HTTPS rồi ghi lại thẻ.

## Deploy nhanh

Kéo cả folder vào [Netlify Drop](https://app.netlify.com/drop) → mở URL HTTPS trên Android → ghi thẻ.

## Giới hạn thẻ

URL nằm trong bộ nhớ thẻ. NTAG213 (~144 byte) dễ đầy; nên dùng **NTAG215/216**, rút ngắn tên/nội dung CK.

## Cấu trúc

```
index.html      # Form ghi NFC
pay.html        # Trang người nhận sau khi chạm thẻ
js/banks.js     # Danh sách ngân hàng
js/pay-link.js  # Tạo / parse link + VietQR ảnh
js/nfc.js       # Web NFC
js/writer.js    # UI ghi thẻ
js/pay.js       # UI trang thanh toán
```
