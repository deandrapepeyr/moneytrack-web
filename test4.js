const https = require('https');

const url = 'https://script.google.com/macros/s/AKfycbzUMwJPy_nwrNw8AJw_SfXRPD8hWzl2rcM_CPtpFD1H2gCqbwWDAwo8HvwobBnDpxI/exec';

function doRequest(requestUrl) {
  const req = https.request(requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  }, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Location:', res.headers.location);
  });
  
  req.on('error', (e) => console.error('Error:', e));
  req.write(JSON.stringify({ action: 'health' }));
  req.end();
}

doRequest(url);
