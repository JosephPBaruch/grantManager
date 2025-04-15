import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";

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
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    async function fetchApprovals() {
      try {
        const response = await fetch('http://localhost:8000/api/v1/grant-approvals/?skip=0&limit=100', {
          headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDUzNzY4MzQsInN1YiI6IjMxYjUzNGZlLTYyNzctNGEwZS04NDUwLTVlZGEzNGFmZTQ5YiJ9.im6ceTmOi6bd76Y1xVkHX2xPr3OIe48tzcw4aD4irYE'
          }
        });
        const data = await response.json();
        setApprovals(data.data);
      } catch (error) {
        console.error("Error fetching approvals:", error);
      }
    }

    fetchApprovals();
  }, []);

  const handleAction = (id, action) => {
    console.log(`Action: ${action}, ID: ${id}`);
    // Add logic to handle approval or denial here
  };

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Approvals
      </Typography>
      <TableContainer component={Paper}>
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
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleAction(approval.id, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => handleAction(approval.id, 'deny')}
                    style={{ marginLeft: '10px' }}
                  >
                    Deny
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

export default Approvals;
