/** Map DB snake_case rows to frontend camelCase shapes */

export function mapProject(row) {
  if (!row) return null;
  return {
    id: `p-${row.id}`,
    dbId: row.id,
    name: row.name,
    companyName: row.company_name,
    location: row.location,
    startDate: row.start_date,
    managerId: row.manager_id ? `emp-${row.manager_id}` : "",
    managerName: row.manager_name || "",
  };
}

export function mapEmployee(row) {
  if (!row) return null;
  const baseUrl = process.env.API_BASE_URL || "";
  return {
    id: `emp-${row.id}`,
    dbId: row.id,
    name: row.name,
    employeeId: row.employee_id,
    mobile: row.mobile,
    email: row.email || "",
    dob: row.dob || "",
    designation: row.designation || "",
    aadhar: row.aadhar || "",
    monthlySalary: String(row.monthly_salary ?? 0),
    projectId: row.project_id ? `p-${row.project_id}` : "",
    vehicleId: row.vehicle_id ? `veh-${row.vehicle_id}` : "",
    route: row.route || "",
    trainingDurationStart: row.training_start || "",
    trainingDurationEnd: row.training_end || "",
    passPhoto: row.pass_photo_url
      ? row.pass_photo_url.startsWith("http")
        ? row.pass_photo_url
        : `${baseUrl}${row.pass_photo_url}`
      : "",
    aadharCardImage: row.aadhar_card_url
      ? row.aadhar_card_url.startsWith("http")
        ? row.aadhar_card_url
        : `${baseUrl}${row.aadhar_card_url}`
      : "",
  };
}

export function mapVehicle(row) {
  if (!row) return null;
  return {
    id: `veh-${row.id}`,
    dbId: row.id,
    vehicleName: row.vehicle_name,
    insuranceDate: row.insurance_date,
    roadTaxExpiryDate: row.road_tax_expiry_date,
    totalPermitExpiryDate: row.total_permit_expiry_date,
  };
}

export function mapMachine(row) {
  if (!row) return null;
  return {
    id: `mac-${row.id}`,
    dbId: row.id,
    entryType: row.entry_type,
    machineName: row.machine_name,
    serialNo: row.serial_no,
    model: row.model,
    projectId: row.project_id ? `p-${row.project_id}` : "",
    returnOrRepair: row.return_or_repair,
    date: row.record_date,
    handoverName: row.handover_name || "",
    handoverDesignation: row.handover_designation || "",
  };
}

export function mapExpense(row) {
  if (!row) return null;
  return {
    id: `exp-${row.id}`,
    dbId: row.id,
    employeeId: `emp-${row.employee_id}`,
    employeeName: row.employee_name,
    advanceType: row.advance_type,
    amount: Number(row.amount),
    date: row.expense_date,
    note: row.note || "",
  };
}

export function mapWorkDetail(row) {
  if (!row) return null;
  return {
    id: `wd-${row.id}`,
    dbId: row.id,
    date: row.work_date,
    name: row.name,
    reason: row.reason,
    status: row.status,
  };
}

export function mapAttendance(row) {
  if (!row) return null;
  return {
    id: `att-${row.employee_id}-${row.attendance_date}`,
    dbId: row.id,
    employeeId: row.employee_id,
    date: row.attendance_date,
    status: row.status,
  };
}

export function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    phone: row.phone,
    name: row.name,
    role: row.role,
    employeeRefId: row.employee_ref_id,
  };
}

export function parsePrefixedId(id) {
  if (!id) return null;
  if (typeof id === "number") return id;
  const str = String(id);
  const match = str.match(/^(?:p|emp|veh|mac|exp|wd)-(\d+)$/);
  if (match) return parseInt(match[1], 10);
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  return null;
}
