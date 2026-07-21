import api from './axios.js';

// Generic CRUD helpers per resource
const resource = (base) => ({
  list: (params) => api.get(base, { params }).then((r) => r.data),
  get: (id) => api.get(`${base}/${id}`).then((r) => r.data),
  create: (data, isForm) =>
    api.post(base, data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}).then((r) => r.data),
  update: (id, data, isForm) =>
    api.put(`${base}/${id}`, data, isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}).then((r) => r.data),
  remove: (id) => api.delete(`${base}/${id}`).then((r) => r.data),
});

export const boardMembersApi = resource('/board-members');
export const servicesApi = resource('/services');
export const offersApi = resource('/offers');
export const lecturesApi = resource('/lectures');
export const judgmentsApi = {
  ...resource('/judgments'),
  meta: () => api.get('/judgments/meta').then((r) => r.data),
  bulkDelete: (ids) => api.post('/judgments/bulk-delete', { ids }).then((r) => r.data),
  deleteAll: () => api.post('/judgments/delete-all').then((r) => r.data),
  bulkUpload: (formData, onProgress) =>
    api
      .post('/judgments/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      })
      .then((r) => r.data),
};
export const booksApi = {
  ...resource('/books'),
  meta: () => api.get('/books/meta').then((r) => r.data),
  bulkDelete: (ids) => api.post('/books/bulk-delete', { ids }).then((r) => r.data),
  deleteAll: () => api.post('/books/delete-all').then((r) => r.data),
  bulkUpload: (formData, onProgress) =>
    api
      .post('/books/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
      })
      .then((r) => r.data),
};
export const contractsApi = resource('/contracts');
export const courtsApi = {
  ...resource('/courts'),
  meta: () => api.get('/courts/meta').then((r) => r.data),
};
export const governmentLinksApi = resource('/government-links');
export const activitiesApi = resource('/activities');
export const complaintsApi = {
  ...resource('/complaints'),
  track: (ticket) => api.get(`/complaints/track/${encodeURIComponent(ticket)}`).then((r) => r.data),
};

export const settingsApi = {
  get: () => api.get('/settings').then((r) => r.data),
  update: (data) => api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
};

export const statsApi = {
  get: () => api.get('/stats').then((r) => r.data),
  uploadConfig: () => api.get('/stats/upload-config').then((r) => r.data),
};

export const backupsApi = {
  list: () => api.get('/admin/backups').then((r) => r.data),
  create: () => api.post('/admin/backups/create').then((r) => r.data),
  progress: () => api.get('/admin/backups/progress').then((r) => r.data),
  remove: (filename) => api.delete(`/admin/backups/${encodeURIComponent(filename)}`).then((r) => r.data),
  // Browser download link (auth via query token since <a> can't send headers)
  downloadUrl: (filename) =>
    `${import.meta.env.VITE_API_URL || ''}/api/admin/backups/${encodeURIComponent(filename)}?token=${encodeURIComponent(localStorage.getItem('token') || '')}`,
};

export const authApi = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  changePassword: (data) => api.put('/auth/password', data).then((r) => r.data),
};
