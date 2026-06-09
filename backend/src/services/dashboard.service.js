import projectRepository from "../repositories/project.repository.js";
import employeeRepository from "../repositories/employee.repository.js";
import vehicleRepository from "../repositories/vehicle.repository.js";
import machineRepository from "../repositories/machine.repository.js";
import expenseRepository from "../repositories/expense.repository.js";
import workDetailRepository from "../repositories/workDetail.repository.js";
import attendanceRepository from "../repositories/attendance.repository.js";
import userRepository from "../repositories/user.repository.js";
import { query } from "../config/db.js";

const dashboardService = {
  async getStats() {
    const [
      projects,
      employees,
      vehicles,
      machines,
      expenses,
      workDetails,
      attendance,
      users,
      workByStatus,
      recentWork,
      recentExpenses,
    ] = await Promise.all([
      projectRepository.count(),
      employeeRepository.count(),
      vehicleRepository.count(),
      machineRepository.count(),
      expenseRepository.count(),
      workDetailRepository.count(),
      attendanceRepository.count(),
      userRepository.countActive(),
      workDetailRepository.countByStatus(),
      query(
        `SELECT name, work_date, status FROM work_details WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`
      ),
      query(
        `SELECT employee_name, amount, expense_date, advance_type FROM expenses WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`
      ),
    ]);

    const statusMap = { Pending: 0, "In Progress": 0, Completed: 0 };
    workByStatus.forEach((r) => {
      statusMap[r.status] = r.count;
    });

    return {
      totals: {
        projects,
        employees,
        vehicles,
        machines,
        expenses,
        workDetails,
        attendance,
        users,
      },
      workOverview: {
        total: workDetails,
        completed: statusMap.Completed,
        inProgress: statusMap["In Progress"],
        pending: statusMap.Pending,
      },
      charts: {
        workByStatus: Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
        })),
      },
      recentActivities: {
        workDetails: recentWork,
        expenses: recentExpenses,
      },
    };
  },
};

export default dashboardService;
