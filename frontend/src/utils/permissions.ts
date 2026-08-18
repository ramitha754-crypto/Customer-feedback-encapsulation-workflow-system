import type { UserPersona } from '../types/feedback';

export const hasPermission = (user: UserPersona | null, permission: string): boolean => {
  return Boolean(user?.permissions?.includes(permission));
};

export const hasAnyPermission = (user: UserPersona | null, permissions: string[]): boolean => {
  if (!user?.permissions?.length) return false;
  return permissions.some((permission) => user.permissions.includes(permission));
};

export const availableDashboardTabs = (user: UserPersona | null): string[] => {
  if (!user) return [];

  const tabs = ['feedback'];

  if (hasAnyPermission(user, ['ENCAPSULATE_FEEDBACK', 'VIEW_ENCAPSULATIONS', 'FULL_ADMIN_ACCESS'])) {
    tabs.push('encapsulation');
  }

  if (hasAnyPermission(user, ['TRANSITION_WORKFLOW', 'ASSIGN_EPIC', 'FULL_ADMIN_ACCESS'])) {
    tabs.push('workflow');
  }

  if (hasAnyPermission(user, ['VIEW_ANALYTICS', 'FULL_ADMIN_ACCESS'])) {
    tabs.push('analytics');
  }

  if (hasAnyPermission(user, ['MANAGE_USERS', 'FULL_ADMIN_ACCESS'])) {
    tabs.push('users');
  }

  if (hasAnyPermission(user, ['VIEW_AUDIT_LOGS', 'FULL_ADMIN_ACCESS'])) {
    tabs.push('audit');
  }

  return tabs;
};

export const canOpenSubmitFeedback = (user: UserPersona | null): boolean => {
  return hasAnyPermission(user, ['CREATE_FEEDBACK', 'SUBMIT_FEEDBACK', 'FULL_ADMIN_ACCESS']);
};

export const canEncapsulateFeedback = (user: UserPersona | null): boolean => {
  return hasAnyPermission(user, ['ENCAPSULATE_FEEDBACK', 'FULL_ADMIN_ACCESS']);
};

export const canTransitionWorkflow = (user: UserPersona | null): boolean => {
  return hasAnyPermission(user, ['TRANSITION_WORKFLOW', 'ASSIGN_EPIC', 'FULL_ADMIN_ACCESS']);
};

export const canCommentFeedback = (user: UserPersona | null): boolean => {
  return hasAnyPermission(user, ['COMMENT_FEEDBACK', 'FULL_ADMIN_ACCESS']);
};
