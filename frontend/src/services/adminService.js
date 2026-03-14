import api from './api';

const adminService = {
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getApplications: async () => {
    try {
      const response = await api.get('/admin/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw error;
    }
  },

  createUser: async ({ email, password, full_name, organization, phone, role_name }) => {
    try {
      const response = await api.post('/admin/users', {
        email,
        password,
        full_name,
        organization,
        phone,
      }, {
        params: { role_name: role_name || 'PP' },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId, { full_name, organization, phone, role_name }) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, {
        full_name,
        organization,
        phone,
        role_name,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  assignRole: async (userId, roleName) => {
    try {
      const response = await api.post(`/admin/users/${userId}/roles`, { role_name: roleName });
      return response.data;
    } catch (error) {
      console.error(`Error assigning role to user ${userId}:`, error);
      throw error;
    }
  },

  removeRole: async (userId, roleName) => {
    try {
      const response = await api.delete(`/admin/users/${userId}/roles/${roleName}`);
      return response.data;
    } catch (error) {
      console.error(`Error removing role from user ${userId}:`, error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  getSectors: async () => {
    try {
      const response = await api.get('/admin/sectors');
      return response.data;
    } catch (error) {
      console.error('Error fetching sectors:', error);
      throw error;
    }
  },

  createSector: async (data) => {
    try {
      const response = await api.post('/admin/sectors', data);
      return response.data;
    } catch (error) {
      console.error('Error creating sector:', error);
      throw error;
    }
  },

  getSectorParameters: async (sectorId) => {
    try {
      const response = await api.get(`/admin/sectors/${sectorId}/parameters`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching parameters for sector ${sectorId}:`, error);
      throw error;
    }
  },

  addSectorParameter: async (sectorId, data) => {
    try {
      const response = await api.post(`/admin/sectors/${sectorId}/parameters`, data);
      return response.data;
    } catch (error) {
      console.error(`Error adding parameter to sector ${sectorId}:`, error);
      throw error;
    }
  },

  getGistTemplates: async (params = {}) => {
    try {
      const response = await api.get('/admin/gist-templates', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching gist templates:', error);
      throw error;
    }
  },

  createGistTemplate: async (data) => {
    try {
      const response = await api.post('/admin/gist-templates', data);
      return response.data;
    } catch (error) {
      console.error('Error creating gist template:', error);
      throw error;
    }
  },
};

export default adminService;
