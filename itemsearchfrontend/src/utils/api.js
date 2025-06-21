import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/auth'; // or your deployed URL

export const loginEmployee = async ({ employeeId, password }) => {
  const res = await axios.post(`${BASE_URL}/login`, {
    employeeId,
    password
  });
  return res.data;
};







export const searchItem = (itemCode, locCode) => {
  return axios.post(`${BASE_URL}/search-item`, {
    itemCode,
    locCode
  });
};


