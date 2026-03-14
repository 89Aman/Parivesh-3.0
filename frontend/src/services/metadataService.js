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

  getDocumentChecklistCategories: async () => {
    try {
      const response = await api.get('/metadata/document-checklists');
      return response.data;
    } catch (error) {
      console.error('Error fetching document checklist categories:', error);
      throw error;
    }
  },

  getDocumentChecklist: async (category) => {
    try {
      const response = await api.get(`/metadata/document-checklists/${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching document checklist for ${category}:`, error);
      throw error;
    }
  },
};

export default metadataService;
