create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  member_name text not null,
  book_title text not null,
  borrow_date date not null default current_date,
  due_date date not null,
  status text not null default 'Dipinjam'
    check (status in ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  created_at timestamptz not null default now(),
  check (due_date >= borrow_date)
);

create index if not exists loans_status_idx on public.loans(status);
create index if not exists loans_member_name_idx on public.loans(member_name);

alter table public.loans enable row level security;

drop policy if exists "Public can read loans" on public.loans;
create policy "Public can read loans" on public.loans for select to anon using (true);
drop policy if exists "Public can create loans" on public.loans;
create policy "Public can create loans" on public.loans for insert to anon with check (true);
drop policy if exists "Public can update loans" on public.loans;
create policy "Public can update loans" on public.loans for update to anon using (true) with check (true);
drop policy if exists "Public can delete loans" on public.loans;
create policy "Public can delete loans" on public.loans for delete to anon using (true);
