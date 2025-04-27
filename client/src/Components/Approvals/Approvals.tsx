import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Approval, ApprovalsResponse } from "../../types/Approval";
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

function Approvals() {
  const classes = useStyles();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const navigate = useNavigate();
  const backendHost = useBackendHost();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [editComment, setEditComment] = useState<string>("");
  const [editExpenseId, setEditExpenseId] = useState<string>("");
  const [editStatus, setEditStatus] = useState<string>("");

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const response = await fetch(`http://${backendHost}:8000/api/v1/grant-approvals/?skip=0&limit=100`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch approvals');
        }

        const data: ApprovalsResponse = await response.json();
        if (Array.isArray(data.data)) {
          setApprovals(data.data);
        } else {
          console.error('Unexpected response format:', data);
          setApprovals([]);
        }
      } catch (error) {
        console.error("Error fetching approvals:", error);
        setApprovals([]);
      }
    }

    fetchApprovals();
  }, []);

  const handleOpenEditDialog = (approval: Approval) => {
    setSelectedApproval(approval);
    setEditExpenseId(approval.expense_id || ""); // Pre-fill with existing expense_id
    setEditStatus(approval.status || ""); // Pre-fill with existing status
    setEditComment(approval.comments || ""); // Pre-fill with existing comment
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedApproval(null);
    setEditExpenseId("");
    setEditStatus("");
    setEditComment("");
  };

  const handleEdit = async () => {
    if (!selectedApproval) return;

    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/grant-approvals/${selectedApproval.id}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expense_id: editExpenseId,
          status: editStatus,
          comments: editComment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to edit approval');
      }

      console.log("Approval edited successfully:", selectedApproval.id);
      setApprovals(approvals.map(approval => 
        approval.id === selectedApproval.id 
          ? { ...approval, expense_id: editExpenseId, status: editStatus, comments: editComment } 
          : approval
      ));
    } catch (error) {
      console.error("Error editing approval:", error);
    } finally {
      handleCloseEditDialog();
    }
  };

  const handleOpenDeleteDialog = (approval: Approval) => {
    setSelectedApproval(approval);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedApproval(null);
  };

  const handleDelete = async () => {
    if (!selectedApproval) return;

    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/grant-approvals/${selectedApproval.id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete approval');
      }

      console.log("Approval deleted successfully:", selectedApproval.id);
      setApprovals(approvals.filter(approval => approval.id !== selectedApproval.id));
    } catch (error) {
      console.error("Error deleting approval:", error);
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleClick = () => {
    navigate("/create-approvals")
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Approvals
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClick}
        style={{ marginBottom: '20px' }}
      >
        Approve Expenses
      </Button><TableContainer component={Paper}>
        <Table className={classes.table} aria-label="approvals table">
          <TableHead>
            <TableRow>
              <TableCell>Expense ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>{approval.expense_id}</TableCell>
                <TableCell>{approval.status}</TableCell>
                <TableCell>{approval.comments}</TableCell>
                <TableCell>{new Date(approval.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(approval.updated_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button 
                    variant="outlined" color="primary" 
                    onClick={() => handleOpenEditDialog(approval)}
                  >
                    Edit
                  </Button>
                  <Button 
                   variant="outlined" color="secondary" 
                    onClick={() => handleOpenDeleteDialog(approval)}
                    style={{ marginLeft: '10px' }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Approval</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Expense ID"
            type="text"
            fullWidth
            value={editExpenseId}
            onChange={(e) => setEditExpenseId(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Status"
            type="text"
            fullWidth
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Comment"
            type="text"
            fullWidth
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Approval</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the approval with ID: {selectedApproval?.id}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Approvals;
