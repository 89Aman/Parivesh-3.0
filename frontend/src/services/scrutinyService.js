import api from './api';

const scrutinyService = {
  getApplicationsForScrutiny: async () => {
    try {
      const response = await api.get('/scrutiny/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching scrutiny applications:', error);
      throw error;
    }
  },

  getApplicationDetails: async (appId) => {
    try {
      const response = await api.get(`/scrutiny/applications/${appId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application ${appId} for scrutiny:`, error);
      throw error;
    }
  },

  acceptApplication: async (appId) => {
    try {
      const response = await api.post(`/scrutiny/applications/${appId}/accept`);
      return response.data;
    } catch (error) {
      console.error(`Error accepting application ${appId}:`, error);
      throw error;
    }
  },

  raiseEDS: async (appId, edsText) => {
    try {
      const response = await api.post(`/scrutiny/applications/${appId}/eds`, { eds_text: edsText });
      return response.data;
    } catch (error) {
      console.error(`Error raising EDS for application ${appId}:`, error);
      throw error;
    }
  },

  recommendForMeeting: async (appId) => {
    try {
      const response = await api.post(`/scrutiny/applications/${appId}/recommend`);
      return response.data;
    } catch (error) {
      console.error(`Error recommending application ${appId} for meeting:`, error);
      throw error;
    }
  },
};

export default scrutinyService;
