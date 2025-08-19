import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import ReactCountryFlag from "react-country-flag";
import { Download } from "lucide-react";

const MAX_AMOUNT = 100_000;

function writeAmountToPath(val) {
  const base = "/";
  const raw = String(val || "").trim();
  if (!raw) {
    window.history.replaceState(null, "", base);
    return;
  }

  const forPath = raw
    .replace(",", ".")
    .replace(/[^0-9.]/g, "")
    .replace(/^(\.)+/, "");
  window.history.replaceState(null, "", forPath ? `/${forPath}` : base);
}

const PayPage = ({ urlAmount }) => {
  const [amount, setAmount] = useState(urlAmount ?? "");
  const qrRef = useRef(null);

  useEffect(() => {
    const onPop = () => {
      const fromPath = decodeURIComponent(
        window.location.pathname.replace(/^\/+/, "")
      );
      setAmount(fromPath || "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function handleAmountChange(e) {
    const raw = e.target.value;
    if (!/^\d*([.,]\d{0,2})?$/.test(raw)) return;

    const normalized = raw.replace(",", ".");
    const [ints] = normalized.split(".");
    if (ints && ints.length > 6) return;

    const num = parseFloat(normalized);
    if (!Number.isNaN(num) && num > MAX_AMOUNT) return;

    setAmount(raw);
    writeAmountToPath(raw);
  }

  function handleAmountBlur() {
    const raw = (amount || "").trim();
    if (raw === "" || raw === "." || raw === ",") {
      setAmount("");
      writeAmountToPath("");
      return;
    }
    const normalized = raw.replace(",", ".");
    let num = parseFloat(normalized);
    if (Number.isNaN(num) || num < 0) num = 0;
    if (num > MAX_AMOUNT) num = MAX_AMOUNT;
    setAmount(num.toFixed(2));
    writeAmountToPath(num.toFixed(2));
  }

  function handleDownload() {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const border = 64;
    const qrSize = 1024;
    const canvasSize = qrSize + 2 * border;

    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, border, border, qrSize, qrSize);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const filename = `pay-wmb-${amount === "" ? "0" : amount}.png`;

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  }

  const spdAmount = (() => {
    const n = Number.parseFloat((amount || "0").replace(",", "."));
    return Number.isFinite(n) ? String(n) : "0";
  })();

  return (
    <main className="max-w-7xl w-full mx-auto md:mt-20 p-5 relative z-40 text-white roboto-regular rounded-xl text-center">
      <h1 className="text-7xl cal-sans-regular">
        pay
        <span className="text-lg text-[#f1ee00]">by wmb</span>
      </h1>

      <div className="relative mx-auto w-full max-w-32 border-4 rounded-md mt-4">
        <div ref={qrRef}>
          <QRCode
            size={1024}
            className="w-full h-auto max-w-full"
            value={`SPD*1.0*ACC:CZ4108000000005808886003*AM:${spdAmount}*CC:CZK*MSG:*RN:MARTIN BENEŠ*X-VS:*`}
            viewBox="0 0 256 256"
            title={`QR payment to MARTIN BENES (CZK ${spdAmount})`}
          />
        </div>

        <button
          type="button"
          aria-label="Download QR code"
          title="Download QR code"
          className="absolute -top-5 -right-5 bg-[#f1ee00] hover:cursor-pointer text-black rounded-full p-2 shadow-lg transition z-10 flex items-center justify-center"
          onClick={handleDownload}
        >
          <Download size={16} />
        </button>
      </div>

      <form className="mt-2" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="amount" className="sr-only">
          Amount in CZK
        </label>
        <input
          id="amount"
          name="amount"
          type="text"
          inputMode="decimal"
          pattern="^\d*([.,]\d{0,2})?$"
          className="font-mono text-2xl w-full max-w-xs px-0 py-2 bg-transparent rounded-none text-center placeholder:text-gray-400 outline-none border-none shadow-none focus:outline-none focus:ring-0 focus:border-none transition-none"
          placeholder="0"
          value={amount}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          autoComplete="off"
          autoFocus
          aria-describedby="currency-code"
        />
        <div
          id="currency-code"
          className="flex items-center justify-center gap-2"
          aria-live="polite"
        >
          <ReactCountryFlag countryCode="CZ" svg />
          CZK
        </div>
      </form>
    </main>
  );
};

export default PayPage;
