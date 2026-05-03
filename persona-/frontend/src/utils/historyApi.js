import axios from 'axios';

export const fetchProductLogs = () =>
  axios.get('/api/history/product-logs');

export const fetchChallanSummary = (filters = {}) =>
  axios.get('/api/history/challan-summary', { params: filters });

export const fetchSalarySummary = (filters = {}) =>
  axios.get('/api/history/salary-summary', { params: filters });
