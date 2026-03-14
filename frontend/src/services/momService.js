import api from './api';

const isNotFoundError = (error) => {
  return Boolean(error?.response?.status === 404);
};

const momService = {
  listApplications: async (status) => {
    const response = await api.get('/mom/applications', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  listMeetings: async () => {
    try {
      const response = await api.get('/mom/meetings');
      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }
      try {
        const fallbackResponse = await api.get('/scrutiny/meetings');
        return fallbackResponse.data;
      } catch {
        return [];
      }
    }
  },

  getGistForApplication: async (appId) => {
    const response = await api.get(`/mom/applications/${appId}/gist`);
    return response.data;
  },

  generateGist: async (appId) => {
    const response = await api.post(`/mom/applications/${appId}/gist/generate`);
    return response.data;
  },

  getMoM: async (appId) => {
    const response = await api.get(`/mom/applications/${appId}/mom`);
    return response.data;
  },

  createOrUpdateMoM: async (appId, content) => {
    const response = await api.post(`/mom/applications/${appId}/mom`, { content });
    return response.data;
  },

  finalizeMoM: async (appId) => {
    const response = await api.post(`/mom/applications/${appId}/mom/finalize`);
    return response.data;
  },
};

export default momService;
