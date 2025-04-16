export interface Rule {
  grant_id: string;
  name: string;
  description: string;
  rule_type: string;
  aggregator: string;
  error_message: string;
  is_active: boolean;
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  filters: Filter[];
  conditions: Condition[];
}

export interface Filter {
  field: string;
  operator: string;
  value: string;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Condition {
  field: string;
  operator: string;
  value: string;
  order: number;
  id: string;
  created_at: string;
  updated_at: string;
}

export interface RulesResponse {
  data: Rule[];
  count: number;
}

export interface Action {
  RuleID: number;
  CID: number;
  Conjunction: string;
  id: number;
}

export interface ActionsResponse {
  data: Action[];
  count: number;
}

export interface Selector {
  Table: string;
  Target: string;
  Aggregator: string;
  Type: string;
  SID: number;
}

export interface SelectorsResponse {
  data: Selector[];
  count: number;
}
