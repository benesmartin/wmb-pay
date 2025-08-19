import React from "react";
import PayPage from "./components/PayPage.jsx";
import ParticlesBackground from "./components/ParticlesBackground.jsx";

function getInitialAmountFromPath() {
  const path = decodeURIComponent(window.location.pathname || "/");
  const seg = path.replace(/^\/+/, "").split("/")[0];
  if (!seg) return "";
  const DEC_RE = /^(\d{1,6})([.,](\d{1,2}))?$/;
  if (!DEC_RE.test(seg)) return "";
  const n = parseFloat(seg.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.min(n, 100_000)).replace(",", ".");
}

const App = () => {
  const initialAmount = getInitialAmountFromPath();

  return (
    <>
      <ParticlesBackground />
      <PayPage urlAmount={initialAmount} />
    </>
  );
};

export default App;
