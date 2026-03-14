import api from './api';

const scrutinyService = {
  getApplicationsForScrutiny: async (status) => {
    const response = await api.get('/scrutiny/applications', { params: status ? { status } : undefined });
    return response.data;
  },

  getApplicationDetails: async (appId) => {
    const response = await api.get(`/scrutiny/applications/${appId}`);
    return response.data;
  },

  getApplicationDocuments: async (appId) => {
    const response = await api.get(`/scrutiny/applications/${appId}/documents`);
    return response.data;
  },

  getPaymentDetails: async (appId) => {
    const response = await api.get(`/scrutiny/applications/${appId}/payment`);
    return response.data;
  },

  acceptApplication: async (appId) => {
    const response = await api.post(`/scrutiny/applications/${appId}/accept`);
    return response.data;
  },

  verifyPayment: async (appId) => {
    const response = await api.post(`/scrutiny/applications/${appId}/payment/verify`);
    return response.data;
  },

  raiseEDS: async (appId, generalComments, issues = []) => {
    const payload = {
      general_comments: generalComments || null,
      issues:
        issues.length > 0
          ? issues
          : [
              {
                standard_reason: 'Additional clarification required',
                comments: generalComments || 'Please provide additional details.',
              },
            ],
    };
    const response = await api.post(`/scrutiny/applications/${appId}/eds`, payload);
    return response.data;
  },

  listMeetings: async () => {
    const response = await api.get('/scrutiny/meetings');
    return response.data;
  },

  createMeeting: async (meetingDate, meetingType = 'EAC', committeeName = 'EAC') => {
    const response = await api.post('/scrutiny/meetings', {
      meeting_date: meetingDate,
      meeting_type: meetingType,
      committee_name: committeeName,
    });
    return response.data;
  },

  referApplication: async (appId, meetingId, referralNotes) => {
    const response = await api.post(`/scrutiny/applications/${appId}/refer`, {
      meeting_id: meetingId,
      referral_notes: referralNotes || null,
    });
    return response.data;
  },
};

export default scrutinyService;
