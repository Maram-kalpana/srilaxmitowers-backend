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

const CARD_ROWS = [
  { key: "employeeId", label: "ID No" },
  { key: "dob", label: "DOB", format: formatCardDate },
  { key: "mobile", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "join", label: "Join", format: formatCardDate },
  { key: "expire", label: "Expire", format: formatCardDate },
];

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

  const rowValues = {
    employeeId: employee.employeeId,
    dob: employee.dob,
    mobile: employee.mobile,
    email: employee.email,
    join: joinDate,
    expire: expireDate,
  };

  return (
    <div className={compact ? "w-full" : "flex flex-col items-center gap-4"}>
      <div
        ref={cardRef}
        className="w-full max-w-[280px] mx-auto rounded-[20px] overflow-hidden shadow-2xl bg-white"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="bg-[#1c1c1c] px-4 pt-5 pb-2 text-center">
          <div className="flex justify-center mb-3 h-12 items-center">
            <img
              src={logo}
              alt={COMPANY_NAME}
              className="h-12 w-auto max-w-[210px] object-contain"
              style={{
                mixBlendMode: "screen",
                filter: "brightness(1.15) contrast(1.05)",
              }}
            />
          </div>
          <h2 className="text-white text-[14px] font-bold uppercase tracking-[0.12em] leading-tight">
            {COMPANY_NAME}
          </h2>
          <p className="text-[#dc2626] text-[9px] font-bold uppercase tracking-[0.22em] mt-1.5">
            {COMPANY_TAGLINE}
          </p>
        </div>

        <WaveDivider />

        <div className="bg-white px-4 pt-6 pb-5 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-[92px] h-[92px] rounded-full border-[3px] border-[#dc2626] overflow-hidden bg-slate-100 flex items-center justify-center">
              {employee.passPhoto ? (
                <img
                  src={employee.passPhoto}
                  alt={employee.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <span className="text-3xl font-bold text-[#dc2626]">
                  {employee.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-[#1c1c1c] text-[17px] font-bold leading-tight">
            {employee.name || "Your Name"}
          </h3>
          <p className="text-[#dc2626] text-[11px] font-semibold mt-1 mb-5">
            {employee.designation || "Designation Here"}
          </p>

          <div className="mx-auto w-full max-w-[200px] space-y-2">
            {CARD_ROWS.map(({ key, label, format }) => {
              const raw = rowValues[key];
              const display = format ? format(raw) : raw || "—";
              return (
                <p
                  key={key}
                  className="text-[11px] leading-tight text-[#333] text-center"
                >
                  <span className="font-semibold text-[#1c1c1c]">{label}</span>
                  <span className="mx-1">:</span>
                  <span>{display}</span>
                </p>
              );
            })}
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
