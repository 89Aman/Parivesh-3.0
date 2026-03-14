import api from './api';

const applicationService = {
  getApplications: async () => {
    try {
      const response = await api.get('/pp/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  getApplicationById: async (id) => {
    try {
      const response = await api.get(`/pp/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${id}:`, error);
      throw error;
    }
  },

  createApplication: async (data) => {
    try {
      const response = await api.post('/pp/applications', data);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  updateApplication: async (id, data) => {
    try {
      const response = await api.put(`/pp/applications/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating application ${id}:`, error);
      throw error;
    }
  },

  submitApplication: async (id) => {
    try {
      const response = await api.post(`/pp/applications/${id}/submit`);
      return response.data;
    } catch (error) {
      console.error(`Error submitting application ${id}:`, error);
      throw error;
    }
  },
};

export default applicationService;
