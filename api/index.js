const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY) : null;
const allowedStatuses = ['Dipinjam', 'Dikembalikan', 'Terlambat'];const fields = ['member_name', 'book_title', 'borrow_date', 'due_date', 'status'];

function requireDatabase(req, res, next) {
  if (!supabase) return res.status(503).json({ error: 'Database belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY.' });
  next();
}
function validateLoan(body = {}, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Body request harus berupa object JSON.';
  if (!partial) for (const key of ['member_name', 'book_title', 'due_date']) {
    if (typeof body[key] !== 'string' || !body[key].trim()) return key + ' wajib diisi sebagai teks.';
  }
  for (const key of ['member_name', 'book_title']) if (body[key] !== undefined && (typeof body[key] !== 'string' || !body[key].trim())) return key + ' harus berupa teks yang tidak kosong.';
  for (const key of ['borrow_date', 'loan_date', 'due_date']) if (body[key] !== undefined && body[key] !== null && (typeof body[key] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body[key]))) return key + ' harus memakai format YYYY-MM-DD.';
  if (body.status !== undefined && !allowedStatuses.includes(body.status)) return 'status harus salah satu dari: ' + allowedStatuses.join(', ') + '.';
  if (partial && ![...fields, 'loan_date'].some((key) => Object.hasOwn(body, key))) return 'Minimal satu field peminjaman harus dikirim.';
  return null;
}app.get('/', (req, res) => res.json({ name: 'Library Loans API', version: '1.0.0', endpoints: ['GET /health', 'GET /loans', 'GET /loans?status=Terlambat', 'GET /loans?member_name=Kiara', 'GET /loans/:id', 'POST /loans', 'PUT /loans/:id', 'PATCH /loans/:id', 'DELETE /loans/:id'] }));
app.get('/health', (req, res) => res.json({ ok: true, databaseConfigured: Boolean(supabase) }));
app.get('/loans', requireDatabase, async (req, res) => {
  let query = supabase.from('loans').select('*').order('created_at', { ascending: false });
  if (req.query.status) {
    if (!allowedStatuses.includes(req.query.status)) return res.status(400).json({ error: 'status harus salah satu dari: ' + allowedStatuses.join(', ') + '.' });
    query = query.eq('status', req.query.status);
  }
  if (req.query.member_name) query = query.ilike('member_name', '%' + String(req.query.member_name) + '%');
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, count: data.length });
});
app.get('/loans/:id', requireDatabase, async (req, res) => {
  const { data, error } = await supabase.from('loans').select('*').eq('id', req.params.id).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan.' });
  res.json({ data });
});
app.post('/loans', requireDatabase, async (req, res) => {
  const invalid = validateLoan(req.body);
  if (invalid) return res.status(400).json({ error: invalid });
  const payload = Object.fromEntries(fields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  payload.borrow_date = payload.borrow_date || req.body.loan_date || new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase.from('loans').insert(payload).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ data });
});
async function updateLoan(req, res) {
  const invalid = validateLoan(req.body, true);
  if (invalid) return res.status(400).json({ error: invalid });
  const payload = Object.fromEntries(fields.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  if (req.body.loan_date !== undefined && req.body.borrow_date === undefined) payload.borrow_date = req.body.loan_date;
  const { data, error } = await supabase.from('loans').update(payload).eq('id', req.params.id).select().maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan.' });
  res.json({ data });
}
app.put('/loans/:id', requireDatabase, updateLoan);
app.patch('/loans/:id', requireDatabase, updateLoan);
app.delete('/loans/:id', requireDatabase, async (req, res) => {
  const { data, error } = await supabase.from('loans').delete().eq('id', req.params.id).select('id').maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Data peminjaman tidak ditemukan.' });
  res.json({ message: 'Data peminjaman berhasil dihapus.', id: data.id });
});
app.use((req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ error: 'JSON request tidak valid.' });
  console.error(err); res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});
if (require.main === module) app.listen(process.env.PORT || 3000, () => console.log('Library Loans API berjalan di port ' + (process.env.PORT || 3000)));
module.exports = app;
