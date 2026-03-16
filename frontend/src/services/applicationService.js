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

  uploadApplicationDocument: async (appId, documentData) => {
    try {
      const response = await api.post(`/pp/applications/${appId}/documents`, documentData);
      return response.data;
    } catch (error) {
      console.error(`Error uploading document for application ${appId}:`, error);
      throw error;
    }
  },

  listApplicationDocuments: async (appId) => {
    try {
      const response = await api.get(`/pp/applications/${appId}/documents`);
      return response.data;
    } catch (error) {
      console.error(`Error listing documents for application ${appId}:`, error);
      throw error;
    }
  },

  getDocumentVerification: async (appId, docId) => {
    try {
      const response = await api.get(`/pp/applications/${appId}/documents/${docId}/verification`);
      return response.data;
    } catch (error) {
      console.error(`Error getting verification for document ${docId} of application ${appId}:`, error);
      throw error;
    }
  },
};

export default applicationService;
