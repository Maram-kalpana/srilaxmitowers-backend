import { useState } from "react";
import { Search, Smartphone } from "lucide-react";
import { useApp } from "../context/AppContext";
import EmployeeIdCardView from "../components/EmployeeIdCardView";
import AppLogo from "../components/AppLogo";

export default function EmployeePortal() {
  const { employees } = useApp();
  const [employeeIdInput, setEmployeeIdInput] = useState("");
  const [found, setFound] = useState(null);
  const [error, setError] = useState("");

  const handleLookup = (e) => {
    e.preventDefault();
    setError("");
    setFound(null);
    const id = employeeIdInput.trim().toUpperCase();
    if (!id) {
      setError("Enter your Employee ID");
      return;
    }
    const match = employees.find((emp) => emp.employeeId.toUpperCase() === id);
    if (!match) {
      setError("Employee ID not found. Contact admin.");
      return;
    }
    setFound(match);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-4 shadow-sm">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <AppLogo size="md" variant="light" />
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Employee Portal</p>
            <p className="font-bold text-slate-900 text-sm">Srilaxmi</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Smartphone className="w-5 h-5" />
          <span className="text-sm font-semibold">Mobile ID Card</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Download your ID card</h1>
        <p className="text-sm text-slate-600 mb-6">
          Enter the Employee ID assigned by admin to view and save your identity card.
        </p>

        <form onSubmit={handleLookup} className="space-y-3 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={employeeIdInput}
              onChange={(e) => setEmployeeIdInput(e.target.value)}
              placeholder="Employee ID (e.g. EMP001)"
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Find my card
          </button>
        </form>

        {found && (
          <div className="animate-in fade-in">
            <EmployeeIdCardView employee={found} showDownload />
            <p className="text-center text-xs text-slate-500 mt-4">
              Tap Download to save the card to your phone gallery.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
