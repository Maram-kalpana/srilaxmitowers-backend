import fetch from 'node-fetch';

const base = 'http://localhost:5000/api';

async function login() {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'admin', password: 'admin123' }),
  });
  const data = await res.json();
  console.log('login', res.status, data.success);
  return data.data.accessToken;
}

async function call(method, path, payload, token) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  };
  if (payload) opts.body = JSON.stringify(payload);
  const res = await fetch(`${base}${path}`, opts);
  const text = await res.text();
  let body = text;
  try {
    body = JSON.parse(text);
  } catch (e) {}
  return { status: res.status, body };
}

async function run() {
  const token = await login();
  const tests = [
    { name: 'project', path: '/projects', payload: { name: 'TProj', companyName: 'C', location: 'L', startDate: '2026-01-01' } },
    { name: 'vehicle', path: '/vehicles', payload: { vehicleName: 'V1', insuranceDate: '2026-01-01', roadTaxExpiryDate: '2026-01-01', totalPermitExpiryDate: '2026-01-01' } },
    { name: 'machine', path: '/machines', payload: { entryType: 'in', machineName: 'M1', serialNo: 'S1', model: 'X', returnOrRepair: 'return', date: '2026-01-01' } },
    { name: 'expense', path: '/expenses', payload: { employeeId: 'emp-1', advanceType: 'petrol', amount: 100, date: '2026-01-01' } },
    { name: 'work', path: '/work-details', payload: { date: '2026-01-01', name: 'W1', reason: 'test', status: 'Pending' } },
  ];

  for (const t of tests) {
    const c = await call('POST', t.path, t.payload, token);
    console.log('create', t.name, c.status, c.body?.message ?? c.body);
    const id = c.body?.data?.item?.id;
    if (id) {
      const updatedPayload = { ...t.payload };
      if (t.payload.name) updatedPayload.name = `${t.payload.name}U`;
      if (t.payload.vehicleName) updatedPayload.vehicleName = `${t.payload.vehicleName}U`;
      if (t.payload.machineName) updatedPayload.machineName = `${t.payload.machineName}U`;
      const u = await call('PUT', `${t.path}/${id}`, updatedPayload, token);
      console.log('update', t.name, u.status, u.body?.message ?? u.body);
      const d = await call('DELETE', `${t.path}/${id}`, null, token);
      console.log('delete', t.name, d.status, d.body?.message ?? d.body);
    }
  }
}

run().catch(console.error);
