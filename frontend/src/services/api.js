import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Cluster
  getClusterStatus: () => axios.get(`${API_BASE}/cluster/status`).then(r => r.data),
  getClusterNodes: () => axios.get(`${API_BASE}/cluster/nodes`).then(r => r.data),
  browseHdfs: (path = '/telecom') => axios.get(`${API_BASE}/cluster/hdfs/browse`, { params: { path } }).then(r => r.data),

  // Analytics
  getOverview: () => axios.get(`${API_BASE}/analytics/overview`).then(r => r.data),
  getRegional: () => axios.get(`${API_BASE}/analytics/regional`).then(r => r.data),

  // Datasets
  getDatasets: () => axios.get(`${API_BASE}/datasets`).then(r => r.data),
  validateDataset: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/datasets/validate`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  uploadToHdfs: (filename, jobId) => {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('job_id', jobId);
    return axios.post(`${API_BASE}/datasets/upload`, formData).then(r => r.data);
  },

  // Jobs
  getJobs: () => axios.get(`${API_BASE}/jobs`).then(r => r.data),
  getJob: (jobId) => axios.get(`${API_BASE}/jobs/${jobId}`).then(r => r.data),
  submitJob: (jobId, hdfsInputPath) => axios.post(`${API_BASE}/jobs`, {
    job_id: jobId,
    hdfs_input_path: hdfsInputPath
  }).then(r => r.data),
  getJobResults: (jobId) => axios.get(`${API_BASE}/jobs/${jobId}/results`).then(r => r.data),
};

export const clusterApi = {
  getStatus: () => axios.get(`${API_BASE}/cluster/status`),
  getNodes: () => axios.get(`${API_BASE}/cluster/nodes`),
  browseHdfs: (path = '/telecom') => axios.get(`${API_BASE}/cluster/hdfs/browse`, { params: { path } }),
};

export const analyticsApi = {
  getOverview: () => axios.get(`${API_BASE}/analytics/overview`),
  getRegional: () => axios.get(`${API_BASE}/analytics/regional`),
};

export const datasetsApi = {
  getAll: () => axios.get(`${API_BASE}/datasets`),
  validate: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BASE}/datasets/validate`, formData);
  },
  upload: (filename, jobId) => {
    const formData = new FormData();
    formData.append('filename', filename);
    formData.append('job_id', jobId);
    return axios.post(`${API_BASE}/datasets/upload`, formData);
  },
};

export const jobsApi = {
  getAll: () => axios.get(`${API_BASE}/jobs`),
  getById: (id) => axios.get(`${API_BASE}/jobs/${id}`),
  submit: (jobId, hdfsPath) => axios.post(`${API_BASE}/jobs`, { job_id: jobId, hdfs_input_path: hdfsPath }),
  getResults: (id) => axios.get(`${API_BASE}/jobs/${id}/results`),
};
