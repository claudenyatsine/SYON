const url = 'https://dzfgdbupfqgijtnziukd.supabase.co/rest/v1/posts?limit=1';
const headers = {
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmdkYnVwZnFnaWp0bnppdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTEyNDQsImV4cCI6MjA5NDA4NzI0NH0.Xn6lFxEB6L3cdm1dn7LUMRCgjyMGszreV_XFHRz38-8'
};

fetch(url, { headers })
  .then(res => res.json())
  .then(data => console.log('COLUMNS:', data.length > 0 ? Object.keys(data[0]) : 'Table is empty, cannot infer columns.'))
  .catch(console.error);
