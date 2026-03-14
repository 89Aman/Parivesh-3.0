import api from './api';

const metadataService = {
  getSectors: async () => {
    try {
      const response = await api.get('/metadata/sectors');
      return response.data;
    } catch (error) {
      console.error('Error fetching sectors:', error);
      throw error;
    }
  },
};

export default metadataService;
