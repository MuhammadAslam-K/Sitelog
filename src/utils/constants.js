/**
 * Application Constants for Kerala Road Construction Management System
 */

export const LOCAL_BODIES = [
  'Grama Panchayat',
  'Block Panchayat',
  'District Panchayat',
  'Municipality',
  'Corporation',
  'Other'
];

export const WORK_TYPES = [
  'Tarring',
  'Road Construction',
  'Road Maintenance',
  'Drainage Work',
  'Concrete Road',
  'Other'
];

export const PROJECT_STATUSES = [
  'Ongoing',
  'Completed',
  'Pending'
];

export const EMPLOYEE_ROLES = [
  'Supervisor',
  'Driver',
  'Site Engineer',
  'Heavy Machinery Operator',
  'Paver Operator',
  'Mason',
  'Helper / Labourer',
  'Other'
];

export const EMPLOYEE_STATUSES = [
  'Active',
  'Inactive'
];

export const ATTENDANCE_STATUSES = [
  'Present',
  'Half Day',
  'Absent / On Leave'
];

export const WAGE_PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Partial',
  'Advance on Leave'
];

export const EXPENSE_CATEGORIES = [
  { 
    id: 'vehicle', 
    label: 'Vehicle', 
    description: 'Repairs, tyres, maintenance, hiring & parts',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  { 
    id: 'material', 
    label: 'Material', 
    description: 'Bitumen, gravel, aggregate, sand, cement & road metal',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  { 
    id: 'fuel', 
    label: 'Fuel', 
    description: 'Diesel, petrol, oil & lubricants for rollers & trucks',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  { 
    id: 'food', 
    label: 'Food', 
    description: 'Site crew meals, tea, refreshments & water supply',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  { 
    id: 'other', 
    label: 'Other', 
    description: 'Permits, toll, small site tools & miscellaneous',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export const COMMON_MATERIAL_ITEMS = [
  'Bitumen VG-30 (Bulk / Drums)',
  'Bitumen VG-10',
  'Bitumen Emulsion RS-1',
  'M-Sand (Manufactured Sand)',
  'P-Sand (Plastering Sand)',
  'Aggregates 20mm (Blue Metal)',
  'Aggregates 40mm (Base Metal)',
  'Aggregates 6mm / Quarry Dust',
  'Granular Sub-Base (GSB)',
  'Wet Mix Macadam (WMM)',
  'Cement UltraTech 53 Grade',
  'Cement Malabar OPC 53',
  'Steel TMT Fe 500D (12mm/16mm)',
  'Precast Kerb Stones',
  'Interlocking Paver Blocks (80mm)',
  'Hume Pipes / Drainage Culvert (600mm)',
  'Road Marking Thermoplastic Paint',
  'PVC Sub-Surface Drainage Pipe',
  'Other Construction Material'
];

export const MATERIAL_UNITS = [
  'Tons',
  'Loads',
  'Bags',
  'Cu.m',
  'Litres',
  'Brass',
  'Kg',
  'Meters',
  'Sq.m',
  'Pieces'
];

export const COMMON_MATERIAL_AGENTS = [
  'Malabar Bitumen Distributors, Kozhikode',
  'Western Ghats Quarry Works',
  'Royal Crushers & M-Sand, Nilambur',
  'UltraTech Cement Regional C&F Agency',
  'Koyilandy Aggregate Suppliers & Lorry Service',
  'Kerala State Stone Crushers Syndicate',
  'Kairali TMT Steel & Hardware Traders',
  'Highland Infra & Quarry Suppliers'
];

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', functional: true },
  { id: 'projects', label: 'Projects', icon: 'FolderKanban', functional: true },
  { id: 'employees', label: 'Employees', icon: 'Users', functional: true },
  { id: 'wages', label: 'Daily Wages', icon: 'Coins', functional: true },
  { id: 'expenses', label: 'Daily Expenses', icon: 'Receipt', functional: true },
  { id: 'materials', label: 'Materials', icon: 'Boxes', functional: true },
  { id: 'machinery', label: 'Machinery & Vehicles', icon: 'Truck', functional: false, phase: 'Phase 6' },
  { id: 'progress', label: 'Site Progress', icon: 'Activity', functional: false, phase: 'Phase 4' },
  { id: 'reports', label: 'Reports', icon: 'FileBarChart', functional: false, phase: 'Phase 7' },
  { id: 'settings', label: 'Settings & Access', icon: 'Settings', functional: true }
];

export const SYSTEM_MODULES = [
  { id: 'projects', label: 'Projects Management', description: 'Tender tracking, road works & budgets' },
  { id: 'employees', label: 'Employees & Workforce', description: 'Staff directory & payroll ledger' },
  { id: 'wages', label: 'Daily Wages & Attendance', description: 'Muster roll, daily wages & site advances' },
  { id: 'expenses', label: 'Daily Site Expenses', description: 'Vehicle, fuel, food & site bills' },
  { id: 'materials', label: 'Materials Management', description: 'Bitumen, quarry aggregate, cement & vendors' },
  { id: 'machinery', label: 'Machinery & Vehicles', description: 'Heavy fleet & logistics log' },
  { id: 'progress', label: 'Site Progress', description: 'Chainage progress & site inspection' },
  { id: 'reports', label: 'Reports & Audits', description: 'Financial statements & PWD compliance' }
];

export const ACCESS_LEVELS = [
  { 
    id: 'none', 
    label: 'No Access', 
    description: 'Module hidden or locked; cannot view', 
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' 
  },
  { 
    id: 'view', 
    label: 'View Only', 
    description: 'Can read, search and filter; cannot add, edit, or delete', 
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' 
  },
  { 
    id: 'edit', 
    label: 'View & Edit', 
    description: 'Full operational access to create, edit, settle, and delete records', 
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' 
  }
];

export const DEFAULT_SUPER_ADMIN = {
  userId: 'usr-super-admin',
  username: 'Muhammad Aslam',
  name: 'Muhammad Aslam',
  email: 'aslamka.2k3@gmail.com',
  password: 'Muhammad@2003',
  role: 'Super Admin',
  designation: 'Managing Director & Super Admin',
  status: 'Active',
  permissions: {
    projects: 'edit',
    employees: 'edit',
    wages: 'edit',
    expenses: 'edit',
    materials: 'edit',
    machinery: 'edit',
    progress: 'edit',
    reports: 'edit',
    settings: 'edit'
  }
};

export const COMPANY_NAME = "Roadways & Infra";
export const COMPANY_TAGLINE = "Kerala Infrastructure & Highway Construction";
