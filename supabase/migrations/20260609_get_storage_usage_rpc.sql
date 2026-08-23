DROP FUNCTION IF EXISTS get_storage_usage() CASCADE;
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS bigint AS $$
DECLARE
  total_size bigint;
BEGIN
  -- Sum up the size of all objects across all buckets
  SELECT SUM((metadata->>'size')::bigint)
  INTO total_size
  FROM storage.objects;
  
  RETURN COALESCE(total_size, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
