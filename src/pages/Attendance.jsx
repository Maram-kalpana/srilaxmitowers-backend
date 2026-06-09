import { useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ListFilters from "../components/ListFilters";
import { useApp } from "../context/AppContext";
import { getAttendanceStatus, isAbsent, isPresent, maskAadhar } from "../utils/hrUtils";
import { matchesSearch } from "../utils/filterUtils";

export default function Attendance() {
  const { employees, attendance, setAttendance } = useApp();
  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );
  const [search, setSearch] = useState("");

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) =>
        matchesSearch(search, emp.name, emp.employeeId, emp.mobile)
      ),
    [employees, search]
  );

  const setAttendanceStatus = (employeeId, status) => {
    setAttendance((prev) => {
      const filtered = prev.filter(
        (r) => !(r.employeeId === employeeId && r.date === selectedDate)
      );
      if (!status) return filtered;
      return [
        ...filtered,
        {
          id: `att-${employeeId}-${selectedDate}`,
          employeeId,
          date: selectedDate,
          status,
        },
      ];
    });
  };

  const daySummary = useMemo(() => {
    let present = 0;
    let absent = 0;
    employees.forEach((emp) => {
      const status = getAttendanceStatus(attendance, emp.employeeId, selectedDate);
      if (status === "present") present += 1;
      else if (status === "absent") absent += 1;
    });
    return { present, absent };
  }, [employees, attendance, selectedDate]);

  const formattedDate = useMemo(() => {
    try {
      return new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Select a date, then mark each employee as present or absent using the
          checkboxes. Only one status can be selected per employee per day.
        </p>

        <ListFilters
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by employee name or ID..."
          date={selectedDate}
          onDateChange={setSelectedDate}
          dateLabel="Attendance date"
        />

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 p-4">
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {daySummary.present}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Present — {formattedDate}
            </p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-4">
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {daySummary.absent}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Absent — {formattedDate}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[880px]">
            <thead>
              <tr className="bg-secondary/50">
                <th className="text-center py-3 px-3 border-b border-r border-border w-14">
                  Present
                </th>
                <th className="text-center py-3 px-3 border-b border-r border-border w-14">
                  Absent
                </th>
                <th className="text-left py-3 px-4 border-b border-r border-border">
                  Name
                </th>
                <th className="text-left py-3 px-4 border-b border-r border-border">
                  Employee ID
                </th>
                <th className="text-left py-3 px-4 border-b border-r border-border">
                  Mobile
                </th>
                <th className="text-left py-3 px-4 border-b border-r border-border">
                  Aadhar
                </th>
                <th className="text-left py-3 px-4 border-b border-border">
                  Monthly Salary
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => {
                const presentChecked = isPresent(
                  attendance,
                  emp.employeeId,
                  selectedDate
                );
                const absentChecked = isAbsent(
                  attendance,
                  emp.employeeId,
                  selectedDate
                );
                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-secondary/20 transition ${
                      presentChecked
                        ? "bg-green-50/50 dark:bg-green-950/10"
                        : absentChecked
                          ? "bg-red-50/50 dark:bg-red-950/10"
                          : ""
                    }`}
                  >
                    <td className="py-3 px-3 border-b border-r border-border text-center">
                      <input
                        type="checkbox"
                        checked={presentChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAttendanceStatus(emp.employeeId, "present");
                          } else if (presentChecked) {
                            setAttendanceStatus(emp.employeeId, null);
                          }
                        }}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                        aria-label={`Mark ${emp.name} present`}
                      />
                    </td>
                    <td className="py-3 px-3 border-b border-r border-border text-center">
                      <input
                        type="checkbox"
                        checked={absentChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAttendanceStatus(emp.employeeId, "absent");
                          } else if (absentChecked) {
                            setAttendanceStatus(emp.employeeId, null);
                          }
                        }}
                        className="w-5 h-5 rounded border-border text-red-600 focus:ring-red-500/30 cursor-pointer"
                        aria-label={`Mark ${emp.name} absent`}
                      />
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border font-medium">
                      {emp.name}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border text-primary">
                      {emp.employeeId}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {emp.mobile}
                    </td>
                    <td className="py-3 px-4 border-b border-r border-border">
                      {maskAadhar(emp.aadhar)}
                    </td>
                    <td className="py-3 px-4 border-b border-border">
                      ₹{Number(emp.monthlySalary).toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {employees.length === 0
                      ? "Add employees first to take attendance."
                      : "No employees match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
