const fetch = require('node-fetch');

// We can't fetch pg_policies without postgres credentials.
// Let's check if the user has standard insert.
console.log("We can't easily query pg_policies via REST.");
