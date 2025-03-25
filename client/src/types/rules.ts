export interface Rule {
  Name: string;
  Description: string;
  Table: string;
  Enabled: boolean;
  RuleID: number;
  Trigger: string;
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

export interface Condition {
  LeftSID: number;
  Operator: string;
  RightSID: number;
  CID: number;
}

export interface ConditionsResponse {
  data: Condition[];
  count: number;
}
