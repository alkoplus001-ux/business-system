// import axios from 'axios';

// //const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
// const api = axios.create({
//   baseURL: 'http://localhost:5000/api' || 'https://gp-fax1.onrender.com'  // your backend server address and port
//     //baseURL: `${base}/api`
// });

// api.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers['x-auth-token'] = token;
//   }
//   return config;
// });

// export default api;
import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api'
      : process.env.REACT_APP_API_BASE_URL   // /api already laga hua hai!
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
