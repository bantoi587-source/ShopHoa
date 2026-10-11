-- Hoa Co Lau V7.3 - them cot giao dien cho site_settings
-- Chay 1 lan trong Supabase > SQL Editor bang owner/postgres.

alter table public.site_settings
  add column if not exists background_color text default '#fffdf8',
  add column if not exists logo_url text default '',
  add column if not exists service_image_url text default '';

update public.site_settings
set
  background_color = coalesce(nullif(background_color, ''), '#fffdf8'),
  logo_url = coalesce(logo_url, ''),
  service_image_url = coalesce(service_image_url, '')
where id = 1;

-- Khong can them RLS policy moi: cac cot nay nam trong cung bang site_settings
-- va dung policy SELECT/UPDATE hien tai cua V6/V7.
