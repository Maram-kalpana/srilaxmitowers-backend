import fetch from 'node-fetch';

const base = 'http://localhost:5000/api';

async function login() {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'admin', password: 'admin123' }),
  });
  return res.json();
}

async function run() {
  const L = await login();
  if (!L.data || !L.data.accessToken) return console.error('login failed', L);
  const token = L.data.accessToken;

  // create
  const uniqueId = `TST${Date.now().toString().slice(-6)}`;
  const createRes = await fetch(`${base}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Test User', employeeId: uniqueId, mobile: '9999999999', monthlySalary: 1000 }),
  });
  const created = await createRes.json();
  console.log('create', createRes.status, created);
  const id = created.data?.item?.id ?? created.data?.item?.id;
  const dbId = created.data?.item?.id ?? null;
  console.log('created item', created.data?.item);

  // update
  if (created.data?.item) {
    const eid = created.data.item.id;
    const payload = { ...created.data.item, name: 'Test User Updated', employeeId: uniqueId, mobile: '9999999999', monthlySalary: 2000, aadhar: '123412341234' };
    console.log('update payload', payload);
    const updateRes = await fetch(`${base}/employees/${eid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    console.log('update', updateRes.status, await updateRes.json());

    // delete
    const delRes = await fetch(`${base}/employees/${eid}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('delete', delRes.status, await delRes.json());
  }
}

run().catch(console.error);
