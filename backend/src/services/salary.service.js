import attendanceRepository from "../repositories/attendance.repository.js";
import expenseRepository from "../repositories/expense.repository.js";

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const salaryService = {
  async calculate(employee, year, month) {
    const monthlySalary = Number(employee.monthly_salary) || 0;
    const daysInMonth = getDaysInMonth(year, month);

    const summary = await attendanceRepository.getMonthSummary(
      employee.employee_id,
      year,
      month
    );

    const dailyRate = daysInMonth > 0 ? monthlySalary / daysInMonth : 0;
    const grossSalary = Math.round(summary.present * dailyRate * 100) / 100;
    const deduction = Math.round(summary.absent * dailyRate * 100) / 100;
    const advanceDeduction = Math.round(
      (await expenseRepository.getMonthTotal(employee.id, year, month)) * 100
    ) / 100;
    const netSalary = Math.max(0, Math.round((grossSalary - advanceDeduction) * 100) / 100);

    return {
      monthlySalary,
      daysInMonth,
      present: summary.present,
      absent: summary.absent,
      presentDates: summary.presentDates,
      absentDates: summary.absentDates,
      dailyRate: Math.round(dailyRate * 100) / 100,
      deduction,
      grossSalary,
      advanceDeduction,
      netSalary,
    };
  },
};

export default salaryService;
