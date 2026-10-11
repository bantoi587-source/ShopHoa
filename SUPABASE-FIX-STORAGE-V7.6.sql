-- HOA CO LAU V7.6 - SUA UPLOAD ANH SUPABASE STORAGE
-- Chay 1 lan trong Supabase > SQL Editor bang role owner/postgres.
-- Muc dich: dam bao bucket shop-images ton tai, Public va user da dang nhap co the upload.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'shop-images',
  'shop-images',
  true,
  15728640,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Policy doc anh. Public bucket da cho phep URL public, policy nay ho tro list/read API neu can.
drop policy if exists "HCL V76 public read shop images" on storage.objects;
create policy "HCL V76 public read shop images"
on storage.objects
for select
to public
using (bucket_id = 'shop-images');

-- Website Admin khong co man hinh dang ky tai khoan; cac thao tac upload chi mo sau khi dang nhap Supabase.
drop policy if exists "HCL V76 authenticated upload shop images" on storage.objects;
create policy "HCL V76 authenticated upload shop images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'shop-images');

drop policy if exists "HCL V76 authenticated update shop images" on storage.objects;
create policy "HCL V76 authenticated update shop images"
on storage.objects
for update
to authenticated
using (bucket_id = 'shop-images')
with check (bucket_id = 'shop-images');

drop policy if exists "HCL V76 authenticated delete shop images" on storage.objects;
create policy "HCL V76 authenticated delete shop images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'shop-images');
