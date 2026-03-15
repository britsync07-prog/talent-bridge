import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@curatedai.com',
      password: 'Password123!'
    });
    console.log('Success:', res.data);
  } catch (err: any) {
    console.log('Error:', err.response?.data || err.message);
  }
}

test();
