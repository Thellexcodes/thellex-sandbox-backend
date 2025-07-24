// src/auth/policies/company-admin.policy.ts
import { RoleEnum } from '@/models/roles-actions.enum';
import { PolicyHandler } from './policy-handler';

export const CanManageCompany = new PolicyHandler((user) => {
  return (
    user.role === RoleEnum.COMPANY_ADMIN || user.role === RoleEnum.SUPER_ADMIN
  );
});

export const CanModerate = new PolicyHandler((user) => {
  return [
    RoleEnum.MODERATOR,
    RoleEnum.COMPANY_ADMIN,
    RoleEnum.SUPER_ADMIN,
  ].includes(user.role);
});
