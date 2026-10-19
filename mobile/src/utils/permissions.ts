import type { Permission, User, UserRole } from '../types';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  manager: 'Manager',
  deliveryperson: 'Delivery Person',
  cattlecaretaker: 'Cattle Caretaker',
  farmcleaner: 'Farm Sweeper/Cleaner',
  customer: 'Customer',
};

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view', 'users:manage', 'customers:view', 'customers:manage',
    'deliveries:view', 'deliveries:manage', 'customer_requests:view',
    'customer_requests:create', 'customer_requests:manage', 'billing:view', 'billing:manage',
    'cattle:view', 'cattle:manage', 'reports:view', 'settings:manage', 'backup:manage',
    'expenses:view', 'expenses:manage', 'income:view', 'income:manage',
  ],
  supervisor: [
    'dashboard:view', 'customers:view', 'customers:manage', 'deliveries:view',
    'deliveries:manage', 'customer_requests:view', 'customer_requests:manage',
    'billing:view', 'cattle:view', 'cattle:manage', 'reports:view',
    'expenses:view', 'expenses:manage', 'income:view', 'income:manage',
  ],
  manager: [
    'dashboard:view', 'customers:view', 'customers:manage', 'deliveries:view',
    'customer_requests:view', 'customer_requests:manage', 'billing:view',
    'billing:manage', 'cattle:view', 'reports:view',
    'expenses:view', 'expenses:manage', 'income:view', 'income:manage',
  ],
  deliveryperson: ['dashboard:view', 'customers:view', 'deliveries:view', 'deliveries:manage', 'customer_requests:view', 'customer_requests:manage'],
  cattlecaretaker: ['dashboard:view', 'cattle:view', 'cattle:manage'],
  farmcleaner: ['dashboard:view'],
  customer: ['dashboard:view', 'customer_requests:create'],
};

const ROLE_ALIASES: Record<string, UserRole> = {
  admin: 'admin',
  owner: 'admin',
  supervisor: 'supervisor',
  manager: 'manager',
  delivery: 'deliveryperson',
  deliveryperson: 'deliveryperson',
  delivery_person: 'deliveryperson',
  'delivery person': 'deliveryperson',
  cattlecare: 'cattlecaretaker',
  cattlecaretaker: 'cattlecaretaker',
  cattle_caretaker: 'cattlecaretaker',
  'cattle care taker': 'cattlecaretaker',
  'cattle caretaker': 'cattlecaretaker',
  cleaner: 'farmcleaner',
  sweeper: 'farmcleaner',
  farmcleaner: 'farmcleaner',
  farm_cleaner: 'farmcleaner',
  'farm cleaner': 'farmcleaner',
  farmsweeper: 'farmcleaner',
  farm_sweeper: 'farmcleaner',
  'farm sweeper': 'farmcleaner',
  'farm sweeper/cleaner': 'farmcleaner',
  customer: 'customer',
  client: 'customer',
  staff: 'supervisor',
};

export function normalizeRole(role?: string | null): UserRole | null {
  return ROLE_ALIASES[String(role || '').trim().toLowerCase()] || null;
}

export function permissionsForUser(user?: User | null): Permission[] {
  if (!user) return [];
  const role = normalizeRole(user.role);
  const roleDefaults = role ? ROLE_PERMISSIONS[role] : [];
  // Server-issued permissions are cached in the stored session at login time, so a permission
  // added in a newer app build (e.g. income:*) would be missing until the user signs in again.
  // Union the two so role defaults always apply.
  const fromServer = user.permissions ?? [];
  return Array.from(new Set<Permission>([...fromServer, ...roleDefaults]));
}

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  return permissionsForUser(user).includes(permission);
}