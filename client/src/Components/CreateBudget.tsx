import { Container, Typography, Paper, TextField, Button, IconButton } from "@mui/material";
import { useState } from "react";
import { makeStyles } from '@mui/styles';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%',
    maxWidth: '400px',
  },
  formField: {
    width: '100%',
  },
  submitButton: {
    marginTop: '10px',
  },
  customRule: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
});

function CreateBudget() {
  const classes = useStyles();
  const [budgetName, setBudgetName] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const nagivate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    const budgetData = {
      name: budgetName,
      funding_source: "string", // Replace with actual funding source if available
      start_date: new Date().toISOString(), // Replace with actual start date if available
      end_date: new Date(endDate).toISOString(),
      amount: parseFloat(totalAmount),
    };

    fetch('http://localhost:8000/api/v1/budget/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(budgetData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      nagivate("/list-transactions")
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  const handleAddRule = () => {
    if (newRule.trim()) {
      setCustomRules([...customRules, newRule]);
      setNewRule('');
    }
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
        <Typography variant="h4">
            UIdaho Grant Management
        </Typography>
      <Typography variant="h6" gutterBottom>
        Create Budget
      </Typography>
      <Paper className={classes.form} component="form" onSubmit={handleSubmit}>
        <TextField
          label="Budget Name"
          variant="outlined"
          className={classes.formField}
          value={budgetName}
          onChange={(e) => setBudgetName(e.target.value)}
          required
        />
        <TextField
          label="End Date"
          type="date"
          variant="outlined"
          className={classes.formField}
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <TextField
          label="Total Amount"
          type="number"
          variant="outlined"
          className={classes.formField}
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          required
        />
        <div className={classes.customRule}>
          <TextField
            label="Custom Rule"
            variant="outlined"
            className={classes.formField}
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
          />
          <IconButton color="primary" onClick={handleAddRule}>
            <AddIcon />
          </IconButton>
        </div>
        {customRules.map((rule, index) => (
          <Typography key={index} variant="body2">
            {rule}
            {/* This will be corrected later on to actually create rules */}
          </Typography>
        ))}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submitButton}
        >
          Create Budget
        </Button>
      </Paper>
    </Container>
  );
}

export default CreateBudget;
