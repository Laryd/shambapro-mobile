export const EXPENSE_CATEGORIES = [
  'land_lease',
  'tilling',
  'soil_testing',
  'seed_cane',
  'fertilizer',
  'pesticides',
  'planting',
  'weeding',
  'irrigation',
  'labor_casual',
  'labor_piece',
  'labor_permanent',
  'harvesting',
  'transportation',
  'fuel',
  'equipment_hire',
  'equipment',
  'maintenance',
  'water_permit',
  'insurance',
  'cooperative_fees',
  'administrative',
  'other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const LOAN_TYPES = [
  'mill_advance',
  'bank_loan',
  'sacco',
  'cooperative',
  'input_credit',
  'other',
] as const;

export type LoanType = (typeof LOAN_TYPES)[number];

export const REPAYMENT_METHODS = [
  'mpesa',
  'cash',
  'bank',
  'mill_deduction',
  'other',
] as const;

export const SUGARCANE_VARIETIES = [
  'Co 421',
  'KEN 83-737',
  'EAK 69-62',
  'EAK 68-133',
  'N 14',
  'Co 740',
  'Other',
];

export const AREA_UNITS = ['acres', 'hectares'] as const;
export const QUANTITY_UNITS = ['tons', 'kg'] as const;

export const COMMON_EXPENSE_UNITS = [
  'bags',
  'kg',
  'liters',
  'hours',
  'days',
  'trips',
  'acres',
  'units',
  'pieces',
];

export const MILL_DEDUCTION_NAMES = [
  'Transport Levy',
  'Development Levy',
  'Cess',
  'Co-op Deduction',
  'Nucleus Estate Levy',
  'Loan Repayment',
  'Other',
];
