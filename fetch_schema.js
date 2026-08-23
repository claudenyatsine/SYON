const url = 'https://dzfgdbupfqgijtnziukd.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6ZmdkYnVwZnFnaWp0bnppdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTEyNDQsImV4cCI6MjA5NDA4NzI0NH0.Xn6lFxEB6L3cdm1dn7LUMRCgjyMGszreV_XFHRz38-8';

fetch(url)
  .then(res => res.json())
  .then(data => {
    console.log(Object.keys(data.definitions || {}));
    if (data.definitions && data.definitions.posts) {
      console.log('POSTS:', Object.keys(data.definitions.posts.properties));
    }
  })
  .catch(console.error);
