/** Danh sách ngân hàng VN (BIN NAPAS) — đủ dùng cho VietQR / chuyển khoản */
export const BANKS = [
  { bin: "970436", code: "VCB", name: "Vietcombank" },
  { bin: "970407", code: "TCB", name: "Techcombank" },
  { bin: "970422", code: "MB", name: "MB Bank" },
  { bin: "970415", code: "ICB", name: "VietinBank" },
  { bin: "970418", code: "BIDV", name: "BIDV" },
  { bin: "970416", code: "ACB", name: "ACB" },
  { bin: "970432", code: "VPB", name: "VPBank" },
  { bin: "970423", code: "TPB", name: "TPBank" },
  { bin: "970403", code: "SCB", name: "Sacombank" },
  { bin: "970437", code: "HDB", name: "HDBank" },
  { bin: "970441", code: "VIB", name: "VIB" },
  { bin: "970443", code: "SHB", name: "SHB" },
  { bin: "970448", code: "OCB", name: "OCB" },
  { bin: "970454", code: "VBA", name: "Agribank" },
  { bin: "970429", code: "SCVL", name: "Saigonbank" },
  { bin: "970426", code: "MSB", name: "MSB" },
  { bin: "970414", code: "DOB", name: "DongA Bank" },
  { bin: "970400", code: "SGN", name: "Saigon Commercial" },
  { bin: "970452", code: "KLB", name: "KienlongBank" },
  { bin: "970449", code: "LPB", name: "LienVietPostBank" },
  { bin: "970431", code: "EIB", name: "Eximbank" },
  { bin: "970425", code: "ABB", name: "ABBank" },
  { bin: "970438", code: "BVB", name: "BaoViet Bank" },
  { bin: "970428", code: "NAMA", name: "Nam A Bank" },
  { bin: "970440", code: "SEAB", name: "SeABank" },
  { bin: "970421", code: "VRB", name: "VRB" },
  { bin: "970458", code: "UOB", name: "United Overseas Bank" },
  { bin: "970427", code: "VAB", name: "VietABank" },
  { bin: "970433", code: "VIETB", name: "VietBank" },
  { bin: "970430", code: "PGB", name: "PG Bank" },
];

export function findBank(binOrCode) {
  const key = String(binOrCode || "").trim().toUpperCase();
  return (
    BANKS.find((b) => b.bin === key || b.code === key) ||
    BANKS.find((b) => b.name.toUpperCase() === key) ||
    null
  );
}
