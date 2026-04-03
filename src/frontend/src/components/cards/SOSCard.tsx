import { AlertTriangle, Phone, Radio } from "lucide-react";
import { useState } from "react";
import SOSModal from "../SOSModal";

export default function SOSCard() {
  const [sosOpen, setSosOpen] = useState(false);

  return (
    <>
      <div
        className="sos-card p-5 rounded-2xl shadow-sos"
        data-ocid="sos.card"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.28 0.09 22) 0%, oklch(0.35 0.12 27) 100%)",
          border: "1px solid oklch(0.45 0.18 27 / 50%)",
        }}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full animate-pulse-sos"
            style={{
              background: "oklch(0.57 0.22 27 / 25%)",
              border: "2px solid oklch(0.57 0.22 27 / 50%)",
            }}
          >
            <AlertTriangle className="h-7 w-7 text-red-300" />
          </div>

          <div>
            <div className="text-2xl font-black text-red-200 tracking-wider">
              SOS
            </div>
            <p className="text-xs text-red-300/70 mt-0.5">
              Emergency Help System
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSosOpen(true)}
            data-ocid="sos.open_modal_button"
            className="w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.18 27) 0%, oklch(0.55 0.22 27) 100%)",
              border: "1px solid oklch(0.6 0.22 27 / 60%)",
              color: "white",
              boxShadow: "0 4px 16px oklch(0.57 0.22 27 / 30%)",
            }}
          >
            Report Emergency / Need Help
          </button>

          <div className="flex gap-3 w-full">
            <div
              className="flex-1 flex items-center gap-1.5 justify-center rounded-lg py-1.5 text-xs"
              style={{ background: "oklch(1 0 0 / 5%)" }}
            >
              <Phone className="h-3 w-3 text-red-400" />
              <span className="text-red-300/70">182</span>
            </div>
            <div
              className="flex-1 flex items-center gap-1.5 justify-center rounded-lg py-1.5 text-xs"
              style={{ background: "oklch(1 0 0 / 5%)" }}
            >
              <Radio className="h-3 w-3 text-red-400" />
              <span className="text-red-300/70">Railway Police</span>
            </div>
          </div>
        </div>
      </div>
      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}
