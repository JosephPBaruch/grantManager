import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { Transaction } from "../types/Transaction";

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  table: {
    width: '100%',
  },
  tableContainer: {
    width: '100%',
    maxWidth: '800px',
    marginBottom: '20px',
  },
});

function ViewTransactions() {
  const classes = useStyles();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/transactions/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((data) => {
      setTransactions(data);
    })
    .catch((error) => {
      console.error('Error fetching transactions:', error);
    });
  }, []);

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transactions
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="transactions table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Amount</TableCell>
              <TableCell align="left">ID</TableCell>
              <TableCell align="left">User</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell align="left">{transaction.amount}</TableCell>
                <TableCell align="left">{transaction.id}</TableCell>
                <TableCell align="left">{transaction.user}</TableCell>
                <TableCell align="left">{new Date(transaction.created_at).toLocaleString()}</TableCell>
                <TableCell component="th" scope="row">
                  {transaction.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default ViewTransactions;
