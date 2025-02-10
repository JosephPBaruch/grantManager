import { Container,  Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { Transaction } from "./types/Transaction";

function ViewTransactions() {
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
    <Container>
      <Typography variant="h1">Transactions</Typography>
      {/* List all of the transactions here */}
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          <Typography variant="body1">{transaction.description}</Typography>
          <Typography variant="body2">{transaction.amount}</Typography>
          <Typography variant="body2">{new Date(transaction.created_at).toLocaleString()}</Typography>
        </div>
      ))}
    </Container>
  );
}

export default ViewTransactions;
