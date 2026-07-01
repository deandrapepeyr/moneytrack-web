const https = require('https');

const url = 'https://script.google.com/macros/s/AKfycbzUMwJPy_nwrNw8AJw_SfXRPD8hWzl2rcM_CPtpFD1H2gCqbwWDAwo8HvwobBnDpxI/exec';

const req = https.request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' }
}, (res) => {
  console.log('Status:', res.statusCode);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Body:', body));
});

req.write(JSON.stringify({ action: 'health' }));
req.end();
