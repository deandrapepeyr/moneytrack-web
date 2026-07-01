const https = require('https');

const url = 'https://script.google.com/macros/s/AKfycbz-ZkBEDVZgXPXcOzbuI3VCTnTyO00pE_bBbPSnR1nhJkQcreWBgN4_7YIPJMondcBO/exec';

function doRequest(requestUrl, method = 'POST', postData = null) {
  const options = {
    method: method,
    headers: {}
  };
  
  if (method === 'POST' && postData) {
    options.headers['Content-Type'] = 'text/plain;charset=utf-8';
    options.headers['Content-Length'] = Buffer.byteLength(postData);
  }

  const req = https.request(requestUrl, options, (res) => {
    console.log('Status:', res.statusCode);
    
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      // Follow redirect with GET
      doRequest(res.headers.location, 'GET');
      return;
    }

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response Body:', data));
  });

  req.on('error', (e) => console.error('Error:', e));

  if (method === 'POST' && postData) {
    req.write(postData);
  }
  req.end();
}

doRequest(url, 'POST', JSON.stringify({
  action: 'auth/register',
  email: 'test3@test.com',
  pin: '123456',
  display_name: 'Test3'
}));
