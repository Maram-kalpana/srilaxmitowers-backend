import { useRef } from "react";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import logo from "../assets/logo.png";
import { COMPANY_NAME, COMPANY_TAGLINE } from "../constants/company";

function formatCardDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CardRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-1 text-[11px] leading-snug">
      <span className="text-[#2d2d2d] font-semibold shrink-0">{label}</span>
      <span className="text-[#2d2d2d]">:</span>
      <span className="text-[#444] flex-1 text-right break-all">{value || "—"}</span>
    </div>
  );
}

function WaveDivider({ flip = false }) {
  return (
    <svg
      viewBox="0 0 280 28"
      className={`w-full block ${flip ? "rotate-180" : ""}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0,14 C35,0 70,28 105,14 C140,0 175,28 210,14 C245,0 262,14 280,14 L280,28 L0,28 Z"
        fill="#dc2626"
      />
      <path
        d="M0,18 C40,6 80,26 120,16 C160,6 200,26 240,16 C260,12 275,16 280,16 L280,28 L0,28 Z"
        fill="#b91c1c"
        opacity="0.85"
      />
    </svg>
  );
}

export default function EmployeeIdCardView({
  employee,
  showDownload = true,
  compact = false,
}) {
  const cardRef = useRef(null);

  if (!employee) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `ID-${employee.employeeId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Could not generate card image. Please try again.");
    }
  };

  const joinDate = employee.joinDate || employee.trainingDurationStart;
  const expireDate = employee.idExpiryDate || employee.trainingDurationEnd;

  return (
    <div className={compact ? "w-full" : "flex flex-col items-center gap-4"}>
      <div
        ref={cardRef}
        className="w-full max-w-[280px] mx-auto rounded-[20px] overflow-hidden shadow-2xl bg-white"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-[#1c1c1c] px-4 pt-5 pb-2 text-center">
          <div className="flex justify-center mb-2">
            <img
              src={logo}
              alt={COMPANY_NAME}
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          </div>
          <h2 className="text-white text-[15px] font-bold uppercase tracking-wide leading-tight">
            {COMPANY_NAME}
          </h2>
          <p className="text-[#dc2626] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {COMPANY_TAGLINE}
          </p>
        </div>

        <WaveDivider />

        {/* Body */}
        <div className="bg-white px-5 pt-6 pb-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-[88px] h-[88px] rounded-full border-[3px] border-[#dc2626] overflow-hidden bg-slate-100 flex items-center justify-center">
              {employee.passPhoto ? (
                <img
                  src={employee.passPhoto}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-[#dc2626]">
                  {employee.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-[#1c1c1c] text-lg font-bold leading-tight">
            {employee.name || "Your Name"}
          </h3>
          <p className="text-[#dc2626] text-xs font-semibold mt-1 mb-5">
            {employee.designation || "Designation Here"}
          </p>

          <div className="space-y-2 text-left px-1">
            <CardRow label="ID No" value={employee.employeeId} />
            <CardRow label="DOB" value={formatCardDate(employee.dob)} />
            <CardRow label="Phone" value={employee.mobile} />
            <CardRow label="Email" value={employee.email} />
            <CardRow label="Join" value={formatCardDate(joinDate)} />
            <CardRow label="Expire" value={formatCardDate(expireDate)} />
          </div>
        </div>

        <WaveDivider flip />
        <div className="h-3 bg-[#1c1c1c]" />
      </div>

      {showDownload && (
        <button
          type="button"
          onClick={handleDownload}
          className="w-full max-w-[280px] h-11 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-md shadow-primary/25"
        >
          <Download className="w-4 h-4" />
          Download ID Card
        </button>
      )}
    </div>
  );
}
