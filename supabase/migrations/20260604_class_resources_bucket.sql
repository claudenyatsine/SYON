-- Create a new storage bucket for class resources
insert into storage.buckets (id, name, public)
values ('class_resources', 'class_resources', true)
on conflict (id) do nothing;

-- Set up security policies
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'class_resources' );

create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'class_resources' and auth.role() = 'authenticated' );
