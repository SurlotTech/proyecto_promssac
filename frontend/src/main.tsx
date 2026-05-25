import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

console.log("%cSulort Tech S.A.C", "font-size:20px;font-weight:bold;color:#2563eb;");

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
