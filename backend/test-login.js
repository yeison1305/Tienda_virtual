const http = require('http');

const data = JSON.stringify({ email: 'admin@void.com', password: '***REMOVED***' });

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Data:', responseData);
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();