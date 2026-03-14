import api from './api';

const momService = {
  getMeetings: async () => {
    try {
      const response = await api.get('/mom/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  },

  getMeetingDetails: async (meetingId) => {
    try {
      const response = await api.get(`/mom/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching meeting ${meetingId}:`, error);
      throw error;
    }
  },

  getGist: async (appId) => {
    try {
      const response = await api.get(`/mom/applications/${appId}/gist`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching gist for application ${appId}:`, error);
      throw error;
    }
  },

  updateMoM: async (appId, meetingId, momText) => {
    try {
      const response = await api.post(`/mom/meetings/${meetingId}/applications/${appId}/mom`, { mom_text: momText });
      return response.data;
    } catch (error) {
      console.error(`Error updating MoM for application ${appId} in meeting ${meetingId}:`, error);
      throw error;
    }
  },

  finalizeMoM: async (meetingId) => {
    try {
      const response = await api.post(`/mom/meetings/${meetingId}/finalize`);
      return response.data;
    } catch (error) {
      console.error(`Error finalizing MoM for meeting ${meetingId}:`, error);
      throw error;
    }
  },
};

export default momService;
