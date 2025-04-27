import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";
import { Expense, ExpensesResponse } from "../../types/Approval";
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
    minWidth: 650,
  },
});

function CreateApprovals() {
  const classes = useStyles();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [comment, setComment] = useState<string>("");
  const backendHost = useBackendHost();
  

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch(`http://${backendHost}:8000/api/v1/grant-approvals/pending-expenses?skip=0&limit=100`, {
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

  const handleOpenDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setComment(""); // Reset comment when opening the dialog
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExpense(null);
    setComment("");
  };

  const handleOpenRejectDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setSelectedExpense(null);
  };

  const handleApprove = async () => {
    if (!selectedExpense) return;

    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/grant-approvals/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expense_id: selectedExpense.id,
          status: "approved",
          comments: comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve expense');
      }

      console.log("Expense approved successfully:", selectedExpense.id);
      // Optionally, refresh the list of expenses or update the UI
      setExpenses(expenses.filter(expense => expense.id !== selectedExpense.id));
    } catch (error) {
      console.error("Error approving expense:", error);
    } finally {
      handleCloseDialog();
    }
  };

  const handleReject = async () => {
    if (!selectedExpense) return;

    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/grant-expenses/${selectedExpense.id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject expense');
      }

      console.log("Expense rejected successfully:", selectedExpense.id);
      // Optionally, refresh the list of expenses or update the UI
      setExpenses(expenses.filter(expense => expense.id !== selectedExpense.id));
    } catch (error) {
      console.error("Error rejecting expense:", error);
    } finally {
      handleCloseRejectDialog();
    }
  };

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
              <TableCell>Actions</TableCell>
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
                <TableCell>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleOpenDialog(expense)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleOpenRejectDialog(expense)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Approve Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve the expense with ID: {selectedExpense?.id}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            type="text"
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleApprove} color="primary">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reject Expense</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject the expense with ID: {selectedExpense?.id}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleReject} color="primary">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CreateApprovals;
