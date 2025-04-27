import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
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
  const [editForm, setEditForm] = useState({
    amount: 0,
    date: "",
    description: "",
    category: "",
    invoice_number: "",
    grant_id: "",
  });
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
    setEditForm({
      amount: transaction.amount || 0,
      date: new Date(transaction.date).toISOString().slice(0, 16), // Format for datetime-local
      description: transaction.description || "",
      category: transaction.category || "",
      invoice_number: transaction.invoice_number || "",
      grant_id: transaction.grant_id || "",
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleEditSave = () => {
    if (!selectedTransaction) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch(`http://${backendHost}:8000/api/v1/grant-expenses/${selectedTransaction.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...editForm,
        date: new Date(editForm.date).toISOString(),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((updatedTransaction) => {
        setTransactions((prev) =>
          prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
        );
        handleEditDialogClose();
      })
      .catch((error) => {
        console.error('Error updating transaction:', error.message);
      });
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
          <form>
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={editForm.amount}
              onChange={handleEditFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date"
              name="date"
              type="datetime-local"
              value={editForm.date}
              onChange={handleEditFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              name="description"
              value={editForm.description}
              onChange={handleEditFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Category"
              name="category"
              value={editForm.category}
              onChange={handleEditFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Invoice Number"
              name="invoice_number"
              value={editForm.invoice_number}
              onChange={handleEditFormChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Grant ID"
              name="grant_id"
              value={editForm.grant_id}
              onChange={handleEditFormChange}
              fullWidth
              margin="normal"
            />
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleEditDialogClose} style={{ marginRight: '10px' }}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleEditSave}>
                Save
              </Button>
            </div>
          </form>
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
