import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { Transaction } from "../../types/Transaction";
import MakeTransactions from "./MakeTransactions"; // Import the MakeTransactions component

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
  const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

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

    // Fetch pending transactions
    fetch('http://127.0.0.1:8080/api/transactions/pending', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((data) => {
      setPendingTransactions(data);
    })
    .catch((error) => {
      console.error('Error fetching pending transactions:', error);
    });
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleApprove = (transactionId: string) => {
    fetch(`http://127.0.0.1:8080/api/transactions/${transactionId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      if (response.ok) {
        setPendingTransactions((prev) => prev.filter((t) => String(t.id)  !== transactionId));
      } else {
        console.error('Failed to approve transaction');
      }
    })
    .catch((error) => {
      console.error('Error approving transaction:', error);
    });
  };

  const handleDisapprove = (transactionId: string) => {
    fetch(`http://127.0.0.1:8080/api/transactions/${transactionId}/disapprove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => {
      if (response.ok) {
        setPendingTransactions((prev) => prev.filter((t) => String(t.id) !== transactionId));
      } else {
        console.error('Failed to disapprove transaction');
      }
    })
    .catch((error) => {
      console.error('Error disapproving transaction:', error);
    });
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Transactions
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Create Transaction
      </Button>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create Transaction</DialogTitle>
        <DialogContent>
          <MakeTransactions />
        </DialogContent>
      </Dialog>
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table>
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
                <TableCell>{transaction.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" component="h2" gutterBottom>
        Pending Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Amount</TableCell>
              <TableCell align="left">ID</TableCell>
              <TableCell align="left">User</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell align="left">{transaction.amount}</TableCell>
                <TableCell align="left">{transaction.id}</TableCell>
                <TableCell align="left">{transaction.user}</TableCell>
                <TableCell align="left">{new Date(transaction.created_at).toLocaleString()}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleApprove(String(transaction.id))}
                    style={{ marginRight: '10px' }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDisapprove(String(transaction.id))}
                  >
                    Disapprove
                  </Button>
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
