-- Run this whole file in the Supabase SQL Editor.
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  artist_name text not null default 'hazecreates',
  eyebrow text not null default 'Independent visual artist - available worldwide',
  headline text not null default 'Making the unreal feel at home.',
  intro text not null default 'A digital artist shaping vivid worlds, expressive characters, and visuals that linger long after the scroll.',
  email text not null default 'hello@hazecreates.com',
  behance text not null default 'https://www.behance.net/',
  instagram text not null default 'https://instagram.com/',
  availability text not null default 'Available for selected commissions',
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  year text not null,
  category text not null,
  art_class text not null default 'solstice',
  description text default '',
  behance_url text default 'https://www.behance.net/',
  featured boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
drop policy if exists "Admins can view own role" on public.admin_users;
create policy "Admins can view own role" on public.admin_users for select to authenticated using (user_id = auth.uid());
drop policy if exists "Public can view site settings" on public.site_settings;
drop policy if exists "Public can view projects" on public.projects;
drop policy if exists "Authenticated users manage settings" on public.site_settings;
drop policy if exists "Authenticated users manage projects" on public.projects;
drop policy if exists "Admin manages settings" on public.site_settings;
drop policy if exists "Admin manages projects" on public.projects;
create policy "Public can view site settings" on public.site_settings for select using (true);
create policy "Public can view projects" on public.projects for select using (true);
create policy "Admin manages settings" on public.site_settings for all to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid())) with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "Admin manages projects" on public.projects for all to authenticated using (exists (select 1 from public.admin_users where user_id = auth.uid())) with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

insert into public.site_settings (artist_name) select 'hazecreates' where not exists (select 1 from public.site_settings);
insert into public.projects (name,type,year,category,art_class,description,sort_order) select * from (values
  ('Solstice','3D Visual','2024','3D','solstice','A sun-drenched study in liquid geometry, warmth, and impossible materials.',1),
  ('Inner Bloom','Character Art','2024','Character','bloom','A portrait about softness, self-possession, and the emotional language of colour.',2),
  ('Maison 04','Brand World','2023','Direction','maison','An architectural visual system for a fictional house of considered objects.',3),
  ('Soft Armour','Editorial','2023','Editorial','armour','Digital couture built around texture, contrast, and a quietly defiant silhouette.',4)
) as seed(name,type,year,category,art_class,description,sort_order) where not exists (select 1 from public.projects);
