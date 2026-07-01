const axios = require('axios');

async function test() {
  try {
    const res = await axios.post(
      'https://script.google.com/macros/s/AKfycbz-ZkBEDVZgXPXcOzbul3VCTnTyO00pE_bBbPSnR1nhJkQcreWBgN4_7YlPJMondcB0/exec',
      JSON.stringify({
        action: 'auth/register',
        email: 'test@test.com',
        pin: '123456',
        display_name: 'Test'
      }),
      {
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
      }
    );
    console.log('SUCCESS:', res.data);
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

test();
