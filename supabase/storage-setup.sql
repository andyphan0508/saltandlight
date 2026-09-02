-- Run once in the Supabase project's SQL editor (Dashboard → SQL Editor).
-- Creates the public bucket product images are uploaded to from the admin
-- dashboard (apps/admin/src/app/api/admin/media/upload).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can read (storefront displays images directly from the public URL).
create policy "Public read access to product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Only the service role (used server-side by the admin app's upload route)
-- may write — the browser never gets direct write access to the bucket.
create policy "Service role can manage product images"
  on storage.objects for all
  using (bucket_id = 'product-images' and auth.role() = 'service_role')
  with check (bucket_id = 'product-images' and auth.role() = 'service_role');
