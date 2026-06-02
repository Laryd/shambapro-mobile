import { CropType } from '@/types';

export const CROP_TYPES: CropType[] = [
  'sugarcane', 'maize', 'groundnuts', 'beans', 'sorghum', 'millet', 'other',
];

export const CROP_LABELS: Record<CropType, string> = {
  sugarcane: 'Sugarcane',
  maize: 'Maize',
  groundnuts: 'Groundnuts',
  beans: 'Beans',
  sorghum: 'Sorghum',
  millet: 'Millet (Wimbi)',
  other: 'Other Crop',
};

export const CROP_EMOJI: Record<CropType, string> = {
  sugarcane: '🎋',
  maize: '🌽',
  groundnuts: '🥜',
  beans: '🫘',
  sorghum: '🌾',
  millet: '🌿',
  other: '🌱',
};

export const CROP_VARIETIES: Record<CropType, string[]> = {
  sugarcane:  ['Co 421', 'KEN 83-737', 'EAK 69-62', 'EAK 68-133', 'N 14', 'Co 740', 'Other'],
  maize:      ['H614D', 'H629', 'DK8031', 'DUMA 43', 'SC403', 'WH505', 'DH04', 'PANNAR 4M21', 'PHB 30G19', 'Other'],
  groundnuts: ['Manipinta', 'Homa Bay', 'Valencia', 'Red Beauty', 'ICGV 06040', 'ICGV 07237', 'Other'],
  beans:      ['Rose Coco', 'Mwitemania', 'Lyamungu 85', 'KATB1', 'KATX69', 'Kenya Wonder', 'Mieze', 'Jesca', 'GLP 585', 'Other'],
  sorghum:    ['Gadam', 'Serena', 'KARI Mtama 1', 'ICSR 93034', 'E 6518', 'Seredo', 'Other'],
  millet:     ['GBK-018263', 'SDMV 89005', 'Serena', 'KAT/PM-1', 'U-15', 'Other'],
  other:      ['Local Variety', 'Improved Variety', 'Other'],
};

// Flat list for backward-compat (all unique category values across crops)
export const EXPENSE_CATEGORIES = [
  'land_lease',
  'tilling',
  'soil_testing',
  'seed_cane',
  'seed',
  'fertilizer',
  'pesticides',
  'planting',
  'weeding',
  'irrigation',
  'labor_casual',
  'labor_piece',
  'labor_permanent',
  'harvesting',
  'shelling',
  'threshing',
  'sorting',
  'drying',
  'storage',
  'transportation',
  'fuel',
  'equipment_hire',
  'equipment',
  'maintenance',
  'water_permit',
  'insurance',
  'cooperative_fees',
  'administrative',
  'processing',
  'other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// Per-crop expense categories
export const CROP_EXPENSE_CATEGORIES: Record<CropType, { value: string; label: string }[]> = {
  sugarcane: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'soil_testing',     label: 'Soil Testing' },
    { value: 'seed_cane',        label: 'Seed Cane / Nursery' },
    { value: 'fertilizer',       label: 'Fertilizer' },
    { value: 'pesticides',       label: 'Pesticides / Herbicides' },
    { value: 'planting',         label: 'Planting' },
    { value: 'weeding',          label: 'Weeding / Slashing' },
    { value: 'irrigation',       label: 'Irrigation' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'labor_permanent',  label: 'Labor — Permanent staff' },
    { value: 'harvesting',       label: 'Harvesting' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel (pump / tractor)' },
    { value: 'equipment_hire',   label: 'Equipment Hire' },
    { value: 'equipment',        label: 'Equipment Purchase / Repair' },
    { value: 'maintenance',      label: 'General Maintenance' },
    { value: 'water_permit',     label: 'Water Permit / WRMA Fee' },
    { value: 'insurance',        label: 'Crop Insurance' },
    { value: 'cooperative_fees', label: 'Co-operative / SACCO Fees' },
    { value: 'administrative',   label: 'Administrative / Registration' },
    { value: 'other',            label: 'Other' },
  ],
  maize: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'soil_testing',     label: 'Soil Testing' },
    { value: 'seed',             label: 'Seed (Maize)' },
    { value: 'fertilizer',       label: 'Fertilizer (DAP / CAN / Urea)' },
    { value: 'pesticides',       label: 'Pesticides / Stalk Borer Control' },
    { value: 'planting',         label: 'Planting' },
    { value: 'weeding',          label: 'Weeding / Slashing' },
    { value: 'irrigation',       label: 'Irrigation' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'labor_permanent',  label: 'Labor — Permanent staff' },
    { value: 'harvesting',       label: 'Harvesting' },
    { value: 'shelling',         label: 'Shelling / Threshing' },
    { value: 'drying',           label: 'Drying' },
    { value: 'storage',          label: 'Storage' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel (pump / tractor)' },
    { value: 'equipment_hire',   label: 'Equipment Hire' },
    { value: 'equipment',        label: 'Equipment Purchase / Repair' },
    { value: 'insurance',        label: 'Crop Insurance' },
    { value: 'cooperative_fees', label: 'Co-operative / NCPB Fees' },
    { value: 'administrative',   label: 'Administrative' },
    { value: 'other',            label: 'Other' },
  ],
  groundnuts: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'soil_testing',     label: 'Soil Testing' },
    { value: 'seed',             label: 'Seed (Groundnuts)' },
    { value: 'fertilizer',       label: 'Fertilizer' },
    { value: 'pesticides',       label: 'Pesticides / Fungicide (Rosette)' },
    { value: 'planting',         label: 'Planting' },
    { value: 'weeding',          label: 'Weeding' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'harvesting',       label: 'Harvesting / Uprooting' },
    { value: 'drying',           label: 'Drying' },
    { value: 'shelling',         label: 'Shelling / Processing' },
    { value: 'storage',          label: 'Storage' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel' },
    { value: 'equipment_hire',   label: 'Equipment Hire' },
    { value: 'insurance',        label: 'Crop Insurance' },
    { value: 'cooperative_fees', label: 'Co-operative Fees' },
    { value: 'administrative',   label: 'Administrative' },
    { value: 'other',            label: 'Other' },
  ],
  beans: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'soil_testing',     label: 'Soil Testing' },
    { value: 'seed',             label: 'Seed (Beans)' },
    { value: 'fertilizer',       label: 'Fertilizer' },
    { value: 'pesticides',       label: 'Pesticides / Fungicide' },
    { value: 'planting',         label: 'Planting' },
    { value: 'weeding',          label: 'Weeding' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'harvesting',       label: 'Harvesting' },
    { value: 'sorting',          label: 'Sorting / Cleaning' },
    { value: 'drying',           label: 'Drying' },
    { value: 'storage',          label: 'Storage' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel' },
    { value: 'equipment_hire',   label: 'Equipment Hire' },
    { value: 'insurance',        label: 'Crop Insurance' },
    { value: 'cooperative_fees', label: 'Co-operative Fees' },
    { value: 'administrative',   label: 'Administrative' },
    { value: 'other',            label: 'Other' },
  ],
  sorghum: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'soil_testing',     label: 'Soil Testing' },
    { value: 'seed',             label: 'Seed (Sorghum)' },
    { value: 'fertilizer',       label: 'Fertilizer' },
    { value: 'pesticides',       label: 'Pesticides / Bird Scaring' },
    { value: 'planting',         label: 'Planting' },
    { value: 'weeding',          label: 'Weeding / Thinning' },
    { value: 'irrigation',       label: 'Irrigation' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'harvesting',       label: 'Harvesting' },
    { value: 'threshing',        label: 'Threshing' },
    { value: 'drying',           label: 'Drying / Storage' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel' },
    { value: 'equipment_hire',   label: 'Equipment Hire' },
    { value: 'insurance',        label: 'Crop Insurance' },
    { value: 'cooperative_fees', label: 'Co-operative Fees' },
    { value: 'administrative',   label: 'Administrative' },
    { value: 'other',            label: 'Other' },
  ],
  millet: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'seed',             label: 'Seed (Millet)' },
    { value: 'fertilizer',       label: 'Fertilizer' },
    { value: 'pesticides',       label: 'Pesticides' },
    { value: 'planting',         label: 'Planting / Broadcast' },
    { value: 'weeding',          label: 'Weeding / Thinning' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'harvesting',       label: 'Harvesting' },
    { value: 'threshing',        label: 'Threshing / Winnowing' },
    { value: 'storage',          label: 'Storage' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel' },
    { value: 'other',            label: 'Other' },
  ],
  other: [
    { value: 'land_lease',       label: 'Land Lease / Rent' },
    { value: 'tilling',          label: 'Tilling / Ploughing' },
    { value: 'soil_testing',     label: 'Soil Testing' },
    { value: 'seed',             label: 'Seed / Seedlings' },
    { value: 'fertilizer',       label: 'Fertilizer' },
    { value: 'pesticides',       label: 'Pesticides / Herbicides' },
    { value: 'planting',         label: 'Planting' },
    { value: 'weeding',          label: 'Weeding' },
    { value: 'irrigation',       label: 'Irrigation' },
    { value: 'labor_casual',     label: 'Labor — Casual (day rate)' },
    { value: 'labor_piece',      label: 'Labor — Piece rate' },
    { value: 'labor_permanent',  label: 'Labor — Permanent staff' },
    { value: 'harvesting',       label: 'Harvesting' },
    { value: 'processing',       label: 'Processing' },
    { value: 'storage',          label: 'Storage' },
    { value: 'transportation',   label: 'Transportation' },
    { value: 'fuel',             label: 'Fuel' },
    { value: 'equipment_hire',   label: 'Equipment Hire' },
    { value: 'equipment',        label: 'Equipment Purchase / Repair' },
    { value: 'maintenance',      label: 'General Maintenance' },
    { value: 'insurance',        label: 'Crop Insurance' },
    { value: 'cooperative_fees', label: 'Co-operative Fees' },
    { value: 'administrative',   label: 'Administrative' },
    { value: 'other',            label: 'Other' },
  ],
};

export function getCropCategories(cropType: CropType) {
  return CROP_EXPENSE_CATEGORIES[cropType] ?? CROP_EXPENSE_CATEGORIES.other;
}

export const CROP_HARVEST_UNITS: Record<CropType, string[]> = {
  sugarcane:  ['tons', 'kg'],
  maize:      ['bags (90kg)', 'kg', 'tons'],
  groundnuts: ['kg', 'bags (50kg)', 'bags (90kg)'],
  beans:      ['kg', 'bags (90kg)'],
  sorghum:    ['kg', 'bags (90kg)', 'tons'],
  millet:     ['kg', 'bags (90kg)'],
  other:      ['kg', 'tons', 'bags', 'units'],
};

export const CROP_USES_MILL_DEDUCTIONS = new Set<CropType>(['sugarcane']);
export const CROP_USES_RATOON = new Set<CropType>(['sugarcane']);

// Legacy — kept for backward compat with any remaining refs
export const SUGARCANE_VARIETIES = CROP_VARIETIES.sugarcane;

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

export const AREA_UNITS = ['acres', 'hectares'] as const;
export const QUANTITY_UNITS = ['tons', 'kg', 'bags (90kg)', 'bags (50kg)', 'units'] as const;

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
