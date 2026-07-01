const https = require('https');

const url = 'https://script.google.com/macros/s/AKfycbz-ZkBEDVZgXPXcOzbuI3VCTnTyO00pE_bBbPSnR1nhJkQcreWBgN4_7YIPJMondcBO/exec';

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(JSON.stringify({
  action: 'auth/register',
  email: 'test2@test.com',
  pin: '123456',
  display_name: 'Test2'
}));
req.end();
