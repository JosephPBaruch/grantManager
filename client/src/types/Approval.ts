export interface Approval {
  expense_id: string;
  status: string;
  comments: string | null; // Allow null for comments if they are optional
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalsResponse {
  data: Approval[]; // Ensure the response contains an array of approvals
  count: number; // Include the count property if it's part of the response
}

export interface Expense {
  amount: number;
  date: string;
  description: string;
  category: string;
  invoice_number: string;
  grant_id: string;
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ExpensesResponse {
  data: Expense[];
  count: number;
}
