import { Container, Typography, Paper, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";
import { Budget } from "../../types/Grant";

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  budgetCard: {
    padding: '20px',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '10px',
  },
  budgetInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  createButton: {
    marginTop: '20px',
  },
});

function Budgets() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/v1/grants/?skip=0&limit=100', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.data && Array.isArray(data.data)) {
        setBudgets(data.data);
      } else {
        console.error('Unexpected data format:', data);
        setBudgets([]);
      }
    })
    .catch((error) => {
      console.error('Error fetching budgets:', error);
    });
  }, []);

  const handleCreateBudget = () => {
    navigate("/create-grant");
  };

  const handleSelectBudget = (id: string, title: string) => {
    localStorage.setItem('selected_grant_id', id);
    localStorage.setItem('selected_grant_title', title);
    navigate("/expenses");
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
        <Typography variant="h4">
                UIdaho Grant Management
        </Typography>
      <Typography variant="h6"  gutterBottom>
        Grants
      </Typography>
      {budgets.length > 0 ? (
        budgets.map((budget) => (
          <Paper 
            style={{backgroundColor: "#e0e0e0", cursor: 'pointer' }} 
            key={budget.id} 
            className={classes.budgetCard}
            onClick={() => handleSelectBudget(budget.id, budget.title)}
          >
            <div className={classes.budgetInfo}>
              <Typography variant="h6">{budget.title}</Typography>
              <Typography variant="body1">Funding Agency: {budget.funding_agency}</Typography>
              <Typography variant="body1">Start Date: {new Date(budget.start_date).toLocaleDateString()}</Typography>
              <Typography variant="body1">End Date: {new Date(budget.end_date).toLocaleDateString()}</Typography>
              <Typography variant="body1">Total Amount: ${budget.total_amount}</Typography>
              <Typography variant="body1">Status: {budget.status}</Typography>
              <Typography variant="body2">Description: {budget.description}</Typography>
            </div>
          </Paper>
        ))
      ) : (
        <Typography variant="body1">No grants found.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        className={classes.createButton}
        onClick={handleCreateBudget}
      >
        Create New Grant
      </Button>
    </Container>
  );
}

export default Budgets;
