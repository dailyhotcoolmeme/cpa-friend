-- 6. Storage Bucket for Images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up access policies for the 'images' bucket
-- Note: Simplified public access for now as per user request for simplicity
create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' );
create policy "Public Insert" on storage.objects for insert with check ( bucket_id = 'images' );
create policy "Public Update" on storage.objects for update with check ( bucket_id = 'images' );
create policy "Public Delete" on storage.objects for delete using ( bucket_id = 'images' );
