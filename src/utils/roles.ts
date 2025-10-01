// src/utils/roles.ts
export type Role = "admin" | "supplier" | "hospital";

export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}
