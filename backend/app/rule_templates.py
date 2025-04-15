from app.models import RuleType, RuleOperator, RuleAggregator

RULE_TEMPLATES = {
    "max_expense_amount": {
        "name": "Maximum Expense Amount",
        "description": "Prevents expenses from exceeding a specified amount",
        "rule_type": RuleType.EXPENSE,
        "filters": [],
        "conditions": [
            {
                "order": 1,
                "field": "amount",
                "operator": RuleOperator.LESS_THAN_EQUALS,
                "value": "1000"
            }
        ],
        "error_message": "Expense amount exceeds the maximum allowed amount"
    },
    "expense_date_range": {
        "name": "Expense Date Range",
        "description": "Ensures expenses are within the grant period",
        "rule_type": RuleType.BUDGET,
        "aggregator": RuleAggregator.SUM,
        "filters": [
            {
                "field": "date",
                "operator": RuleOperator.GREATER_THAN_EQUALS,
                "value": "grant.start_date"
            },
            {
                "field": "date",
                "operator": RuleOperator.LESS_THAN_EQUALS,
                "value": "grant.end_date"
            }
        ],
        "conditions": [
            {
                "order": 1,
                "field": "amount",
                "operator": RuleOperator.LESS_THAN,
                "value": "100000"
            }
        ],
        "error_message": "Total expenses exceed the grant period limit"
    },
    "category_restriction": {
        "name": "Category Restriction",
        "description": "Restricts expenses to specific categories",
        "rule_type": RuleType.EXPENSE,
        "filters": [],
        "conditions": [
            {
                "order": 1,
                "field": "category",
                "operator": RuleOperator.IN,
                "value": "['SAL', 'TRV', 'EQP']"
            }
        ],
        "error_message": "Expense category is not allowed"
    }
} 