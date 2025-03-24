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
