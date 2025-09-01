// src/auth/policies/interfaces/policy-handler.interface.ts
// export interface PolicyHandler {
//   handle(ability: AppAbility): boolean;
// }

export type PolicyCheck = (user: any) => boolean;

export class PolicyHandler {
  constructor(private readonly check: PolicyCheck) {}

  handle(user: any): boolean {
    return this.check(user);
  }
}
