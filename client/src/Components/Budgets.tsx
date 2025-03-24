import { Container, Typography, Paper, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";
import { Budget } from "../types/Budget";

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
    fetch('http://localhost:8000/api/v1/budget/?skip=0&limit=100', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      setBudgets(data);
    })
    .catch((error) => {
      console.error('Error fetching budgets:', error);
    });
  }, []);

  const handleCreateBudget = () => {
    navigate("/create-budget");
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
        <Typography variant="h4">
                UIdaho Grant Management
        </Typography>
      <Typography variant="h6"  gutterBottom>
        Budgets
      </Typography>
      {budgets.length > 0 ? (
        budgets.map((budget) => (
          <Paper style={{backgroundColor: "#e0e0e0" }} key={budget.id} className={classes.budgetCard}>
            <div className={classes.budgetInfo}>
              <Typography variant="h6">{budget.name}</Typography>
              <Typography variant="body1">End Date: {new Date(budget.endDate).toLocaleDateString()}</Typography>
              <Typography variant="body1">Total Amount: ${budget.totalAmount}</Typography>
              <Typography variant="body2">Rules: {budget.rules.join(', ')}</Typography>
            </div>
          </Paper>
        ))
      ) : (
        <Typography variant="body1">No budgets found.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        className={classes.createButton}
        onClick={handleCreateBudget}
      >
        Create New Budget
      </Button>
    </Container>
  );
}

export default Budgets;
