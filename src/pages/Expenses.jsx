import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import ListFilters from "../components/ListFilters";
import { useApp } from "../context/AppContext";
import { matchesDate, matchesSearch } from "../utils/filterUtils";

const ADVANCE_TYPES = [
  { value: "petrol", label: "Petrol" },
  { value: "ta-da", label: "TA / DA" },
  { value: "others", label: "Others" },
];

function SlidePanel({ open, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 h-full w-full max-w-[420px] bg-card border-l border-border shadow-2xl overflow-y-auto">
        {children}
      </div>
    </>
  );
}

function LabeledInput({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="relative">
      {label && (
        <label className="absolute left-4 -top-2.5 bg-card px-1 text-xs text-muted-foreground z-10">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark]"
      />
    </div>
  );
}

function LabeledSelect({ label, value, onChange, children }) {
  return (
    <div className="relative">
      {label && (
        <label className="absolute left-4 -top-2.5 bg-card px-1 text-xs text-muted-foreground z-10">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className="w-full h-11 rounded-2xl border border-border bg-background px-4 pr-10 text-foreground outline-none appearance-none focus:ring-2 focus:ring-primary/30"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  );
}

const emptyForm = {
  employeeId: "",
  advanceType: "petrol",
  amount: "",
  date: "",
  note: "",
};

function advanceTypeLabel(value) {
  return ADVANCE_TYPES.find((t) => t.value === value)?.label ?? value;
}

export default function Expenses() {
  const { expenses, setExpenses, employees } = useApp();
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const itemsPerPage = 5;

  useEffect(() => setCurrentPage(1), [search, filterDate]);

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp?.name ?? "—";
  };

  const filtered = useMemo(() => {
    return expenses.filter((row) => {
      const name = getEmployeeName(row.employeeId);
      return (
        matchesSearch(
          search,
          name,
          advanceTypeLabel(row.advanceType),
          row.amount,
          row.note
        ) && matchesDate(filterDate, row.date)
      );
    });
  }, [expenses, search, filterDate, employees]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.employeeId) return alert("Please select an employee");
    if (!form.amount.toString().trim() || Number(form.amount) <= 0) {
      return alert("Please enter a valid advance amount");
    }
    if (!form.date) return alert("Please select the advance date");

    const emp = employees.find((e) => e.id === form.employeeId);
    const payload = {
      employeeId: form.employeeId,
      employeeName: emp?.name ?? "",
      advanceType: form.advanceType,
      amount: Number(form.amount),
      date: form.date,
      note: form.note.trim(),
    };

    if (editingId) {
      setExpenses((prev) =>
        prev.map((row) => (row.id === editingId ? { ...row, ...payload } : row))
      );
    } else {
      setExpenses((prev) => [...prev, { id: `exp-${Date.now()}`, ...payload }]);
    }

    setOpenPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      employeeId: row.employeeId || "",
      advanceType: row.advanceType || "petrol",
      amount: row.amount?.toString() ?? "",
      date: row.date || "",
      note: row.note || "",
    });
    setOpenPanel(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this advance record?")) return;
    setExpenses((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Record employee advances (petrol, TA/DA, or others). Amounts are
              deducted from salary for the same month on salary slips.
            </p>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setEditingId(null);
                setOpenPanel(true);
              }}
              className="h-11 px-5 rounded-2xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-md shadow-primary/25"
            >
              <Plus className="w-4 h-4" />
              Add Advance
            </button>
          </div>

          <ListFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by employee, advance type, amount..."
            date={filterDate}
            onDateChange={setFilterDate}
            dateLabel="Advance date"
          />

          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-secondary/50">
                  {["Date", "Employee", "Advance Type", "Amount", "Note", "Actions"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`py-3 px-4 border-b border-r border-border font-semibold ${
                          i === 5 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row) => (
                  <tr key={row.id} className="hover:bg-secondary/30">
                    <td className="py-3 px-4 border-b border-r border-border">{row.date}</td>
                    <td className="py-3 px-4 border-b border-r border-border font-medium">
                      {row.employeeName || getEmployeeName(row.employeeId)}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {advanceTypeLabel(row.advanceType)}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      ₹{Number(row.amount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border text-muted-foreground">
                      {row.note || "—"}
                    </td>
                    <td className="py-3 px-4 border-b border-border text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => handleEdit(row)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(row.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted-foreground">
                      No advance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </AdminLayout>

      <SlidePanel open={openPanel} onClose={() => setOpenPanel(false)}>
        <div className="p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Advance" : "Add Advance"}
            </h2>
            <button type="button" onClick={() => setOpenPanel(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <LabeledSelect
            label="Employee Name"
            value={form.employeeId}
            onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeId})
              </option>
            ))}
          </LabeledSelect>

          <LabeledSelect
            label="Advance For"
            value={form.advanceType}
            onChange={(e) => setForm((p) => ({ ...p, advanceType: e.target.value }))}
          >
            {ADVANCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </LabeledSelect>

          <LabeledInput
            label="Advance Amount (₹)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="Amount to deduct from salary"
          />

          <LabeledInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
          />

          <LabeledInput
            label="Note (optional)"
            value={form.note}
            onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            placeholder="Additional details"
          />

          <p className="text-xs text-muted-foreground rounded-xl bg-secondary/40 px-3 py-2">
            This advance will be deducted from the employee&apos;s net salary for the
            month of the selected date.
          </p>

          <button
            type="button"
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold"
          >
            Save Advance
          </button>
        </div>
      </SlidePanel>
    </>
  );
}
