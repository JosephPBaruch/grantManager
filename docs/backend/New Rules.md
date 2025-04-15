
There are two types of rules
 - Per Expense Rules
 - Per Grant Rules

## Per Expense Rules
Per expense rules are rules that apply to each expense individually, Some example of a per expense rule is:
- Travel expenses have to be through specified vendors
- No equipment expense may be for more than $5000
## Per Grant Rules
Per grant rules are rules that apply some type of aggregator on the expenses for a grant and then check that the aggregated values meet some condition. Ie:
- The total amount of expenses between two dates does not exceed $100,000
- Total travel expenses must be less than $10,000

# Rules
For either type, creating a rule involves the following:
- Create filters for a rule
- Set the rule condition
- (Per-Grant only) Choose the aggregator

## Filters
Filters are how you can choose which expenses are considered for the given condition.
For example, 

The rule: *Travel expenses have to be through specified vendors* would use the following filters:
- Category = Travel

For the rule *The total amount of personal compensation per year must not exceed $100,000*:
- date < (Start_Date, ie: 01/01/2020)
- date > (Start_Date, ie: 01/01/2021)
- Category = Personal Compensation 

## Conditions
Conditions specify the condition that an expense must meet to be valid. Conditions use one of the following comparison operators:
- <
- >
- <=
- >=
- =
- IN

For example:

For the rule *No equipment expense may be for more than $5000*:
- amount < $5000

*Travel expenses have to be through specified vendors*:
- vendor IN (Delta, Alaska Airlines, ...)

## Aggregators
Aggregators are specific to Per-Grant Rules and specify the aggregation operator to use on all of the expenses for a given grant. Aggregators are one of the following:
- SUM
- MAX
- MIN
- AVG
- COUNT
For the rule *Total travel expenses must be less than $10,000* the aggregator would be SUM
For the rule *The amount of equipment purchases must be less than 10* the aggregator would be COUNT

# Rule Example
The following is an example of what a full rule looks like as a json object, ie for use with the api
Rule: *The total amount of personal compensation per year must not exceed $100,000*
```json
{
    "expense_date_range": {
        "name": "Limit Max Personal Compensation Per Year",
        "description": "The total amount of personal compensation per year must not exceed $100,000",
        "rule_type": "BUDGET",
        "grant_id" : 1,
        "aggregator" : "SUM",
        "filters": [
            {
                "field": "date",
                "operator": ">=",
                "value": "grant.start_date",
            },
            {
                "field": "date",
                "operator": "<=",
                "value": "grant.end_date",
            },
            {
                "field": "category",
                "operator": "=",
                "value": "PC", // Personal Compensation Category Code
            },
        ],
        "condition": {
            "order" : "1",
            "field": "amount",
            "operator": "<",
            "value": "100000",
        },
        "error_message": "Total amount of personal compensation per year greater than $100,000"
    },
}
```
