import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, X, CreditCard, ChevronDown, Eye } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import ListFilters from "../components/ListFilters";
import { useApp } from "../context/AppContext";
import EmployeeIdCardView from "../components/EmployeeIdCardView";
import { matchesDate, matchesSearch } from "../utils/filterUtils";

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
        className="w-full h-11 rounded-2xl border border-border bg-background px-4 text-foreground outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

const MAX_IMAGE_SIZE_MB = 2;

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
  name: "",
  employeeId: "",
  mobile: "",
  email: "",
  dob: "",
  designation: "",
  aadhar: "",
  monthlySalary: "",
  vehicleId: "",
  route: "",
  trainingDurationStart: "",
  trainingDurationEnd: "",
  passPhoto: "",
  aadharCardImage: "",
};

function readImageFile(file, onDone) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    alert("Please upload an image file (JPG, PNG, etc.)");
    return;
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    alert(`Image must be under ${MAX_IMAGE_SIZE_MB} MB`);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onDone(reader.result);
  reader.readAsDataURL(file);
}

function FileUploadField({ label, value, onChange, accept = "image/*" }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {value ? (
        <div className="relative rounded-xl border border-border overflow-hidden bg-secondary/30">
          <img src={value} alt={label} className="w-full max-h-36 object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded-lg bg-card border border-border hover:bg-secondary"
          >
            Remove
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-border cursor-pointer hover:bg-secondary/30 transition">
          <span className="text-xs text-muted-foreground">Click to upload image</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              readImageFile(file, onChange);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}

export default function Employees() {
  const { employees, setEmployees, vehicles } = useApp();
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openPanel, setOpenPanel] = useState(false);
  const [openCard, setOpenCard] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [docsEmployee, setDocsEmployee] = useState(null);
  const [cardEmployee, setCardEmployee] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const itemsPerPage = 5;

  useEffect(() => setCurrentPage(1), [search, filterDate]);

  const getVehicleName = (vehicleId) =>
    vehicles.find((v) => v.id === vehicleId)?.vehicleName ?? "—";

  const filtered = useMemo(() => {
    return employees.filter(
      (e) =>
        matchesSearch(
          search,
          e.name,
          e.employeeId,
          e.mobile,
          e.email,
          getVehicleName(e.vehicleId),
          e.route
        ) &&
        matchesDate(
          filterDate,
          e.dob,
          e.trainingDurationStart,
          e.trainingDurationEnd
        )
    );
  }, [employees, search, filterDate, vehicles]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    if (!form.name.trim()) return alert("Please enter name");
    if (!form.employeeId.trim()) return alert("Please enter Employee ID");
    if (!form.mobile.trim()) return alert("Please enter mobile number");
    if (!form.aadhar.trim()) return alert("Please enter Aadhar number");
    if (!form.monthlySalary.toString().trim()) return alert("Please enter monthly salary");

    const empIdUpper = form.employeeId.trim().toUpperCase();
    const duplicate = employees.find(
      (e) =>
        e.employeeId.toUpperCase() === empIdUpper &&
        e.id !== editingId
    );
    if (duplicate) return alert("Employee ID already exists");

    if (
      form.trainingDurationStart &&
      form.trainingDurationEnd &&
      form.trainingDurationStart > form.trainingDurationEnd
    ) {
      return alert("Training end date must be on or after start date");
    }

    const payload = {
      name: form.name.trim(),
      employeeId: empIdUpper,
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      dob: form.dob || "",
      designation: form.designation.trim(),
      aadhar: form.aadhar.trim().replace(/\s/g, ""),
      monthlySalary: form.monthlySalary.toString().trim(),
      vehicleId: form.vehicleId || "",
      route: form.route.trim(),
      trainingDurationStart: form.trainingDurationStart || "",
      trainingDurationEnd: form.trainingDurationEnd || "",
      passPhoto: form.passPhoto || "",
      aadharCardImage: form.aadharCardImage || "",
    };

    if (editingId) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === editingId ? { ...e, ...payload } : e))
      );
    } else {
      setEmployees((prev) => [...prev, { id: `emp-${Date.now()}`, ...payload }]);
    }

    setOpenPanel(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name || "",
      employeeId: emp.employeeId || "",
      mobile: emp.mobile || "",
      email: emp.email || "",
      dob: emp.dob || "",
      designation: emp.designation || "",
      aadhar: emp.aadhar || "",
      monthlySalary: emp.monthlySalary ?? "",
      vehicleId: emp.vehicleId || "",
      route: emp.route || "",
      trainingDurationStart: emp.trainingDurationStart || "",
      trainingDurationEnd: emp.trainingDurationEnd || "",
      passPhoto: emp.passPhoto || "",
      aadharCardImage: emp.aadharCardImage || "",
    });
    setOpenPanel(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this employee?")) return;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const cardEmployeeDisplay = useMemo(() => {
    if (!cardEmployee) return null;
    return employees.find((e) => e.id === cardEmployee.id) ?? cardEmployee;
  }, [cardEmployee, employees]);

  const formIdCardPreview = useMemo(
    () => ({
      id: editingId || "preview",
      name: form.name.trim() || "Employee Name",
      employeeId: form.employeeId.trim().toUpperCase() || "EMP000",
      mobile: form.mobile.trim() || "—",
      email: form.email.trim() || "—",
      dob: form.dob || "",
      designation: form.designation.trim() || "Designation Here",
      trainingDurationStart: form.trainingDurationStart || "",
      trainingDurationEnd: form.trainingDurationEnd || "",
      passPhoto: form.passPhoto || "",
    }),
    [form, editingId]
  );

  const showCard = (emp) => {
    const latest = employees.find((e) => e.id === emp.id) ?? emp;
    setCardEmployee(latest);
    setOpenCard(true);
  };

  const showDocuments = (emp) => {
    const latest = employees.find((e) => e.id === emp.id) ?? emp;
    setDocsEmployee(latest);
    setOpenDocs(true);
  };

  return (
    <>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Add employees and generate downloadable ID cards from Employee ID.
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
              Add Employee
            </button>
          </div>

          <ListFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by name, ID, route..."
            date={filterDate}
            onDateChange={setFilterDate}
            dateLabel="DOB / join / expire date"
          />

          <div className="bg-card rounded-xl border border-border overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-secondary/50">
                    {[
                    "Name",
                    "Employee ID",
                    "Vehicle",
                    "Route",
                    "Mobile",
                    "Documents",
                    "Actions",
                  ].map((h, i) => (
                      <th
                        key={h}
                        className={`py-3 px-4 border-b border-r border-border font-semibold ${
                          i === 7 ? "text-right" : "text-left"
                        }`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((emp) => (
                  <tr key={emp.id} className="hover:bg-secondary/30">
                    <td className="py-3 px-4 border-b border-r border-border">{emp.name}</td>
                    <td className="py-3 px-4 border-b border-r border-border font-medium text-primary">
                      {emp.employeeId}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {getVehicleName(emp.vehicleId)}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border text-xs">
                      {emp.route || "—"}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">{emp.mobile}</td>
                    <td className="py-3 px-4 border-b border-r border-border text-xs">
                      {emp.passPhoto || emp.aadharCardImage ? (
                        <button
                          type="button"
                          onClick={() => showDocuments(emp)}
                          className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b border-border text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="ID Card"
                          onClick={() => showCard(emp)}
                          className="p-1.5 rounded-lg hover:bg-secondary"
                        >
                          <CreditCard className="w-4 h-4 text-primary" />
                        </button>
                        <button type="button" onClick={() => handleEdit(emp)}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-muted-foreground">
                      No employees found.
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

          <p className="text-xs text-muted-foreground px-1">
            Employees can download their ID card on mobile at{" "}
            <span className="text-primary font-medium">#/employee</span>
          </p>
        </div>
      </AdminLayout>

      <SlidePanel open={openPanel} onClose={() => setOpenPanel(false)}>
        <div className="p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{editingId ? "Edit Employee" : "Add Employee"}</h2>
            <button type="button" onClick={() => setOpenPanel(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <LabeledInput
            label="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Full name"
          />
          <LabeledInput
            label="Employee ID"
            value={form.employeeId}
            onChange={(e) => setForm((p) => ({ ...p, employeeId: e.target.value }))}
            placeholder="e.g. EMP001"
          />
          <LabeledInput
            label="Mobile Number"
            value={form.mobile}
            onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
            placeholder="10-digit mobile"
          />
          <LabeledInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@example.com"
          />
          <LabeledInput
            label="Date of Birth"
            type="date"
            value={form.dob}
            onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
          />
          <LabeledInput
            label="Designation"
            value={form.designation}
            onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
            placeholder="e.g. Site Engineer"
          />
          <LabeledSelect
            label="Vehicle"
            value={form.vehicleId}
            onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}
          >
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleName}
              </option>
            ))}
          </LabeledSelect>
          <LabeledInput
            label="Route"
            value={form.route}
            onChange={(e) => setForm((p) => ({ ...p, route: e.target.value }))}
            placeholder="e.g. Hyderabad — Site A"
          />
          <LabeledInput
            label="Aadhar Number"
            value={form.aadhar}
            onChange={(e) => setForm((p) => ({ ...p, aadhar: e.target.value }))}
            placeholder="12-digit Aadhar"
          />
          <LabeledInput
            label="Monthly Salary"
            type="number"
            value={form.monthlySalary}
            onChange={(e) => setForm((p) => ({ ...p, monthlySalary: e.target.value }))}
            placeholder="Amount in ₹"
          />
          <FileUploadField
            label="Passport Size Photo"
            value={form.passPhoto}
            onChange={(dataUrl) => setForm((p) => ({ ...p, passPhoto: dataUrl }))}
          />
          {form.passPhoto && (
            <div className="rounded-xl border border-border bg-secondary/20 p-4">
              <p className="text-sm font-medium text-foreground mb-3">
                ID card preview (photo)
              </p>
              <EmployeeIdCardView
                employee={formIdCardPreview}
                showDownload={false}
                compact
              />
            </div>
          )}
          <FileUploadField
            label="Aadhar Card (upload scan/photo)"
            value={form.aadharCardImage}
            onChange={(dataUrl) => setForm((p) => ({ ...p, aadharCardImage: dataUrl }))}
          />
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              ID card validity (Join &amp; Expire on card)
            </p>
            <div className="grid grid-cols-1 gap-3">
              <LabeledInput
                label="Join date"
                type="date"
                value={form.trainingDurationStart}
                onChange={(e) =>
                  setForm((p) => ({ ...p, trainingDurationStart: e.target.value }))
                }
              />
              <LabeledInput
                label="Expire date"
                type="date"
                value={form.trainingDurationEnd}
                onChange={(e) =>
                  setForm((p) => ({ ...p, trainingDurationEnd: e.target.value }))
                }
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold"
          >
            Save Employee
          </button>
        </div>
      </SlidePanel>

      {openDocs && docsEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">Uploaded Documents</h3>
                <p className="text-xs text-muted-foreground">
                  {docsEmployee.name} · {docsEmployee.employeeId}
                </p>
              </div>
              <button type="button" onClick={() => setOpenDocs(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold mb-2">Passport Size Photo</p>
                {docsEmployee.passPhoto ? (
                  <img
                    src={docsEmployee.passPhoto}
                    alt="Passport photo"
                    className="w-full max-h-64 object-contain rounded-xl border border-border bg-secondary/20"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Not uploaded</p>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Aadhar Card</p>
                {docsEmployee.aadharCardImage ? (
                  <img
                    src={docsEmployee.aadharCardImage}
                    alt="Aadhar card"
                    className="w-full max-h-64 object-contain rounded-xl border border-border bg-secondary/20"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Not uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {openCard && cardEmployeeDisplay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Employee ID Card</h3>
              <button type="button" onClick={() => setOpenCard(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <EmployeeIdCardView employee={cardEmployeeDisplay} />
          </div>
        </div>
      )}
    </>
  );
}
