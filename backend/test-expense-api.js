import fetch from 'node-fetch';

const base = 'http://localhost:5000/api';

async function login() {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'admin', password: 'admin123' }),
  });
  return (await res.json()).data.accessToken;
}

async function call(method, path, payload, token) {
  const opts = { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
  if (payload) opts.body = JSON.stringify(payload);
  const res = await fetch(`${base}${path}`, opts);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function run() {
  const token = await login();
  const employeeRes = await call('POST', '/employees', { name: 'Expense Test', employeeId: `EXP${Date.now()}`, mobile: '9999999999', monthlySalary: 1000 }, token);
  console.log('employee', employeeRes.status, employeeRes.body?.message);
  const employeeId = employeeRes.body?.data?.item?.id;
  if (!employeeId) return;
  const expenseRes = await call('POST', '/expenses', { employeeId, advanceType: 'petrol', amount: 100, date: '2026-01-01' }, token);
  console.log('expense create', expenseRes.status, expenseRes.body);
  const expenseId = expenseRes.body?.data?.item?.id;
  if (!expenseId) return;
  const updateRes = await call('PUT', `/expenses/${expenseId}`, { employeeId, advanceType: 'petrol', amount: 150, date: '2026-01-01' }, token);
  console.log('expense update', updateRes.status, updateRes.body);
  const deleteRes = await call('DELETE', `/expenses/${expenseId}`, null, token);
  console.log('expense delete', deleteRes.status, deleteRes.body);
}

run().catch(console.error);
