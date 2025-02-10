# Backend Service SRS

## Prompt

```text
Grant Budget Management System:

Once a budget is generated and approved, the budgeted amounts must
be spent in a legally approved manner.

For example,
i - salaried amount cannot be spent on travel, or for equipment purchase,
ii - travels must be using national carriers, and
iii - no expenses can be paid that will cover non-budgeted periods (beyond project period, such as equipment warranties, insurance, or membership fees).

Your system must allow a pre-approval process and setting aside the money so that double commitments are
not made or the amount overspent. Finalize the expenses once it is spent.

Support expense projection, show available funds, show multiple funds, and analysis of how an expense can be supported by multiple grants.

You will need to create:

a database of expense categories
an expense analyzer to determine expense validity
a budget reconciler.
You should allow multiple approvers, users, and fund owners with multiple grants.

```

## Database Scheme

### Attributes
- User
    - approver
    - fund owners 
- Category (expense categories)
- Amount
- Approved (allows for expense projection)

- Fund/Grant/Budget Instance
    - Name/ID
    - Creation date
    - Expiration Date
    - 

Need a way to represent all of the users, admins, and owners for a given budget

## Use Cases

## Questions

- What are all of the rules which need to be implemented? 
    - Did Hasan mean that we don't need to code all of these but show proof that they could be inputted to the system?        
- Doesn't a budget reconciler come integrate with the database? Same as the expense validity? 
- What does this mean? ->  show multiple funds, and analysis of how an expense can be supported by multiple grants.