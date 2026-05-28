export type Locale = 'en' | 'sw';

export interface UserSubscription {
  plan: 'free_trial' | 'monthly' | 'yearly' | 'none';
  status: 'active' | 'expired' | 'cancelled';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  mpesaPhone?: string;
  exemptUntil?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  language: Locale;
  subscription: UserSubscription;
  createdAt?: string;
}

export interface Plot {
  _id: string;
  userId: string;
  plotCode: string;
  name: string;
  location?: string;
  area: number;
  areaUnit: 'acres' | 'hectares';
  variety: string;
  plantingDate: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  status: 'active' | 'harvested' | 'archived';
  landLeaseAmount?: number;
  ratoonCycle: number;
  cycleStartDate?: string;
  seasonBudget?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  plotId?: string;
  category: string;
  description: string;
  amount: number;
  quantity?: number;
  unit?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MillDeduction {
  name: string;
  amount: number;
}

export interface Harvest {
  _id: string;
  userId: string;
  plotId: string;
  quantity: number;
  quantityUnit: 'tons' | 'kg';
  pricePerUnit: number;
  grossAmount: number;
  millDeductions: MillDeduction[];
  totalDeductions: number;
  netReceived: number;
  totalRevenue: number;
  date: string;
  buyer?: string;
  millStatementRef?: string;
  ratoonCycle?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repayment {
  _id?: string;
  date: string;
  amount: number;
  method: 'mpesa' | 'cash' | 'bank' | 'mill_deduction' | 'other';
  reference?: string;
  notes?: string;
}

export interface Loan {
  _id: string;
  userId: string;
  plotId?: string;
  type: 'mill_advance' | 'bank_loan' | 'sacco' | 'cooperative' | 'input_credit' | 'other';
  lender: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  dueDate?: string;
  repayments: Repayment[];
  totalRepaid: number;
  balanceOutstanding: number;
  status: 'active' | 'repaid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  category: string;
  budgetedAmount: number;
  actualAmount?: number;
  variance?: number;
  notes?: string;
}

export interface Budget {
  _id: string;
  userId: string;
  plotId: string;
  plot?: Plot;
  season: string;
  items: BudgetItem[];
  totalBudget: number;
  totalActual?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  plotId?: string;
  expenseId?: string;
  harvestId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlotAnalytics {
  plotId: string;
  plotName: string;
  plotCode: string;
  area: number;
  areaUnit: string;
  totalExpenses: number;
  grossRevenue: number;
  totalDeductions: number;
  netRevenue: number;
  profit: number;
  profitMargin: number;
  costPerAcre: number;
  costPerTon: number;
  totalHarvestTons: number;
  harvestCount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  profit: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface Analytics {
  farm: {
    totalExpenses: number;
    grossRevenue: number;
    totalDeductions: number;
    netRevenue: number;
    profit: number;
    profitMargin: number;
    costPerAcre: number;
    revenuePerAcre: number;
    costPerTon: number;
    totalHarvestTons: number;
    totalArea: number;
  };
  plots: PlotAnalytics[];
  categoryTotals: CategoryTotal[];
  monthlyTrend: MonthlyTrend[];
  loansSummary: {
    totalOutstanding: number;
    activeCount: number;
    overdueCount: number;
  };
}

export interface SubscriptionState {
  plan: string;
  status: string;
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysLeft: number | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  exemptUntil?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
