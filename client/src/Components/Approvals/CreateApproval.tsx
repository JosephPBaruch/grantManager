import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";
import { Expense, ExpensesResponse } from "../../types/Approval";

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  table: {
    minWidth: 650,
  },
});

function CreateApprovals() {
  const classes = useStyles();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch('http://localhost:8000/api/v1/grant-approvals/pending-expenses?skip=0&limit=100', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          },
          body: ''
        });

        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }

        const data: ExpensesResponse = await response.json();
        console.log(data);
        if (Array.isArray(data.data)) {
          setExpenses(data.data);
        } else {
          console.error('Unexpected response format:', data);
          setExpenses([]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setExpenses([]);
      }
    }

    fetchExpenses();
  }, []);

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pending Expenses
      </Typography>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="expenses table">
          <TableHead>
            <TableRow>
              <TableCell>Expense ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Grant ID</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.id}</TableCell>
                <TableCell>{expense.amount}</TableCell>
                <TableCell>{new Date(expense.date).toLocaleString()}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.invoice_number}</TableCell>
                <TableCell>{expense.grant_id}</TableCell>
                <TableCell>{new Date(expense.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(expense.updated_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default CreateApprovals;
