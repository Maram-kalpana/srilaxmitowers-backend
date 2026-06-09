import { useMemo, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import html2canvas from "html2canvas";
import AdminLayout from "../components/AdminLayout";
import ListFilters from "../components/ListFilters";
import { useApp } from "../context/AppContext";
import { matchesSearch } from "../utils/filterUtils";
import {
  calculateSalary,
  MONTH_NAMES,
  summarizeAttendance,
} from "../utils/hrUtils";

function SalarySlipDocument({ employee, breakdown, periodLabel }) {
  return (
    <div
      className="bg-white text-slate-900 rounded-xl border border-slate-200 p-6 max-w-lg mx-auto"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="border-b border-slate-200 pb-4 mb-4">
        <p className="text-xs uppercase tracking-widest text-slate-500">Salary Slip</p>
        <h2 className="text-xl font-bold">Srilaxmi</h2>
        <p className="text-sm text-slate-600">{periodLabel}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-6">
        <div>
          <p className="text-slate-500 text-xs">Employee Name</p>
          <p className="font-semibold">{employee.name}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Employee ID</p>
          <p className="font-semibold">{employee.employeeId}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Mobile</p>
          <p>{employee.mobile}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Monthly Salary</p>
          <p>₹{breakdown.monthlySalary.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
          <p className="text-xs text-green-700 uppercase">Present Days</p>
          <p className="text-2xl font-bold text-green-800">{breakdown.present}</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
          <p className="text-xs text-red-700 uppercase">Absent Days</p>
          <p className="text-2xl font-bold text-red-800">{breakdown.absent}</p>
        </div>
      </div>

      <table className="w-full text-sm border-collapse mb-4">
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-2 text-slate-600">Days in month</td>
            <td className="py-2 text-right font-medium">{breakdown.daysInMonth}</td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 text-slate-600">Daily rate</td>
            <td className="py-2 text-right">
              ₹{breakdown.dailyRate.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 text-slate-600">Gross (present days)</td>
            <td className="py-2 text-right">
              ₹{breakdown.grossSalary.toLocaleString("en-IN")}
            </td>
          </tr>
          <tr className="border-b border-slate-100">
            <td className="py-2 text-slate-600">Deduction (absent)</td>
            <td className="py-2 text-right text-red-600">
              − ₹{breakdown.deduction.toLocaleString("en-IN")}
            </td>
          </tr>
          {breakdown.advanceDeduction > 0 && (
            <tr className="border-b border-slate-100">
              <td className="py-2 text-slate-600">Advance deduction</td>
              <td className="py-2 text-right text-red-600">
                − ₹{breakdown.advanceDeduction.toLocaleString("en-IN")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
        <span className="font-semibold text-blue-900">Net Payable</span>
        <span className="text-2xl font-bold text-blue-700">
          ₹{breakdown.netSalary.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return y;
});

export default function SalarySlips() {
  const { employees, attendance, expenses } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const slipRef = useRef(null);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) =>
        matchesSearch(search, emp.name, emp.employeeId, emp.mobile)
      ),
    [employees, search]
  );

  const periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  const breakdown = useMemo(() => {
    if (!selectedEmployee) return null;
    return calculateSalary(selectedEmployee, attendance, year, month, expenses);
  }, [selectedEmployee, attendance, year, month, expenses]);

  const attendanceDetail = useMemo(() => {
    if (!selectedEmployee) return null;
    return summarizeAttendance(
      attendance,
      selectedEmployee.employeeId,
      year,
      month
    );
  }, [selectedEmployee, attendance, year, month]);

  const openSlipModal = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setSlipModalOpen(true);
  };

  const closeSlipModal = () => {
    setSlipModalOpen(false);
  };

  const downloadSlip = async () => {
    if (!slipRef.current || !selectedEmployee) return;
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `Salary-${selectedEmployee.employeeId}-${year}-${month}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Could not download slip. Try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Choose month and year, then click an employee to view their salary slip
          in a popup with present and absent details.
        </p>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-sm font-medium block mb-2">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-11 min-w-[160px] rounded-xl border border-border bg-background px-4"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-11 min-w-[120px] rounded-xl border border-border bg-background px-4"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ListFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search employee by name or ID..."
          showDate={false}
        />

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/40">
            <h3 className="font-semibold text-sm">Employees — click to view payslip</h3>
          </div>
          <ul className="divide-y divide-border">
            {filteredEmployees.map((emp) => {
              const summary = summarizeAttendance(
                attendance,
                emp.employeeId,
                year,
                month
              );
              return (
                <li key={emp.id}>
                  <button
                    type="button"
                    onClick={() => openSlipModal(emp.id)}
                    className="w-full text-left px-4 py-3 flex flex-wrap items-center justify-between gap-2 transition hover:bg-secondary/50"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-700 font-medium">
                        Present: {summary.present}
                      </span>
                      <span className="text-red-700 font-medium">
                        Absent: {summary.absent}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
            {filteredEmployees.length === 0 && (
              <li className="py-10 text-center text-muted-foreground text-sm">
                {employees.length === 0
                  ? "No employees added yet."
                  : "No employees match your search."}
              </li>
            )}
          </ul>
        </div>
      </div>

      {slipModalOpen && selectedEmployee && breakdown && attendanceDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeSlipModal}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-card">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedEmployee.name} — {periodLabel}
                </h3>
                <p className="text-xs text-muted-foreground">Salary slip preview</p>
              </div>
              <button
                type="button"
                onClick={closeSlipModal}
                className="p-2 rounded-lg hover:bg-secondary"
                aria-label="Close salary slip"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-5">
                  <p className="text-sm font-semibold text-green-800 mb-1">Present</p>
                  <p className="text-3xl font-bold text-green-700">
                    {attendanceDetail.present} days
                  </p>
                  {attendanceDetail.presentDates.length > 0 ? (
                    <p className="text-xs text-green-800/80 mt-3 leading-relaxed">
                      {attendanceDetail.presentDates.join(", ")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      No present marks for this month.
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-5">
                  <p className="text-sm font-semibold text-red-800 mb-1">Absent</p>
                  <p className="text-3xl font-bold text-red-700">
                    {attendanceDetail.absent} days
                  </p>
                  {attendanceDetail.absentDates?.length > 0 ? (
                    <p className="text-xs text-red-800/80 mt-3 leading-relaxed">
                      {attendanceDetail.absentDates.join(", ")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      No absent marks for this month.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={downloadSlip}
                className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Download Salary Slip
              </button>

              <div ref={slipRef}>
                <SalarySlipDocument
                  employee={selectedEmployee}
                  breakdown={breakdown}
                  periodLabel={periodLabel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
