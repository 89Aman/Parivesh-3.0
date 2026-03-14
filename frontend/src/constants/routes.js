export const ROUTE_PREFIX = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
  PP: '/pp',
  COMMITTEE_SCRUTINY: '/committee/scrutiny',
  COMMITTEE_MOM: '/committee/mom-editor',
};

export const ROUTES = {
  ROOT: ROUTE_PREFIX.ROOT,
  LOGIN: ROUTE_PREFIX.LOGIN,
  REGISTER: ROUTE_PREFIX.REGISTER,

  ADMIN_DASHBOARD: `${ROUTE_PREFIX.ADMIN}/dashboard`,
  ADMIN_ANALYTICS: `${ROUTE_PREFIX.ADMIN}/analytics`,
  ADMIN_MAP: `${ROUTE_PREFIX.ADMIN}/map`,
  ADMIN_COMPLIANCE: `${ROUTE_PREFIX.ADMIN}/compliance`,

  PP_DASHBOARD: `${ROUTE_PREFIX.PP}/dashboard`,
  PP_NEW_APPLICATION: `${ROUTE_PREFIX.PP}/new-application`,
  PP_APPLICATIONS: `${ROUTE_PREFIX.PP}/applications`,
  PP_WORKFLOW: `${ROUTE_PREFIX.PP}/workflow/:appId?`,
  PP_REVIEW: `${ROUTE_PREFIX.PP}/review/:appId?`,
  PP_APPLICATION_DETAIL: `${ROUTE_PREFIX.PP}/application/:appId`,
  PP_COMPLIANCE: `${ROUTE_PREFIX.PP}/compliance/:appId`,

  COMMITTEE_SCRUTINY: ROUTE_PREFIX.COMMITTEE_SCRUTINY,
  COMMITTEE_MOM_EDITOR: ROUTE_PREFIX.COMMITTEE_MOM,
};

export const LEGACY_ROUTE_ALIASES = {
  '/admin/sidebar': ROUTES.ADMIN_DASHBOARD,
  '/admin/stats': ROUTES.ADMIN_ANALYTICS,
  '/committee/mom': ROUTES.COMMITTEE_MOM_EDITOR,
};
