import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { Transaction } from "../../types/Transaction";
import MakeTransactions from "./CreateExpenses"; // Import the MakeTransactions component
import { useBackendHost } from "../../host";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false); // State for edit dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for delete dialog
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null); // Selected transaction
  const backendHost = useBackendHost();

  useEffect(() => {

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch(`http://${backendHost}:8000/api/v1/grant-expenses/?grant_id=${localStorage.getItem('selected_grant_title')}&skip=0&limit=100`, {
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

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedTransaction) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch(`http://${backendHost}:8000/api/v1/grant-expenses/${selectedTransaction.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setTransactions((prev) => prev.filter((t) => t.id !== selectedTransaction.id));
        handleDeleteDialogClose();
      })
      .catch((error) => {
        console.error('Error deleting transaction:', error.message);
      });
  };

  return (
    <Container maxWidth="md" className={classes.root}>
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
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .filter((transaction) => transaction.grant_id === localStorage.getItem("selected_grant_id"))
              .map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell align="left">{transaction.amount}</TableCell>
                  <TableCell align="left">{new Date(transaction.date).toLocaleString()}</TableCell>
                  <TableCell align="left">{transaction.description}</TableCell>
                  <TableCell align="left">{transaction.category}</TableCell>
                  <TableCell align="left">{transaction.created_by}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" color="primary" onClick={() => handleEditClick(transaction)}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => handleDeleteClick(transaction)} style={{ marginLeft: '10px' }}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          {/* {selectedTransaction && (
            // <MakeTransactions transaction={selectedTransaction} onClose={handleEditDialogClose} />
          )} */}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this expense?</Typography>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleDeleteDialogClose} style={{ marginRight: '10px' }}>
              Cancel
            </Button>
            <Button variant="contained" color="secondary" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Expenses;
