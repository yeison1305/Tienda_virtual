const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MDA5MDAyOS03OTRjLTRkYTAtOGZhYy1jZTAwODAyZDExMTYiLCJpYXQiOjE3ODUxODIwNTcsImV4cCI6MTc4NTc4Njg1N30.e5ugq1aunBOc0SPGRt0mWGcqyshSbbapzP-rlregciM';

const data = JSON.stringify({
  subject: 'Test Newsletter',
  title: 'Nueva colección disponible',
  message: 'Hola comunidad,\n\nEstamos emocionados de anunciar nuestra nueva colección.\n\nSaludos,\nEl equipo VOID',
  ctaText: 'Ver colección',
  ctaLink: 'https://tutienda.com/novedades'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/admin/newsletter/send',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
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