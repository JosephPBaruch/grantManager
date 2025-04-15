import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { Transaction } from "../../types/Transaction";
import MakeTransactions from "./CreateExpenses"; // Import the MakeTransactions component

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

function Expenses() {
  const classes = useStyles();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openDialog, setOpenDialog] = useState(false); 

  useEffect(() => {

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch(`http://127.0.0.1:8000/api/v1/grant-expenses/?grant_id=${localStorage.getItem('selected_grant_title')}&skip=0&limit=100`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      setTransactions(data.data); 
    })
    .catch((error) => {
      console.error('Error fetching transactions:', error.message);
    });
  }, []);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Expenses
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Create Expense
      </Button>
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create Expense</DialogTitle>
        <DialogContent>
          <MakeTransactions />
        </DialogContent>
      </Dialog>
      <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="left">Amount</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Description</TableCell>
              <TableCell align="left">Category</TableCell>
              <TableCell align="left">Created By</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell align="left">{transaction.amount}</TableCell>
                <TableCell align="left">{new Date(transaction.date).toLocaleString()}</TableCell>
                <TableCell align="left">{transaction.description}</TableCell>
                <TableCell align="left">{transaction.category}</TableCell>
                <TableCell align="left">{transaction.created_by}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Expenses;
