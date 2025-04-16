import { Container, Typography, Paper, TextField, Button } from "@mui/material";
import { useState } from "react";
import { makeStyles } from '@mui/styles';
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
  const [title, setTitle] = useState('');
  const [fundingAgency, setFundingAgency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    const grantData = {
      title,
      funding_agency: fundingAgency,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      total_amount: parseFloat(totalAmount),
      status: "active", // Default status
      description,
    };

    fetch('http://localhost:8000/api/v1/grants/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(grantData),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      localStorage.setItem('selected_grant_id', data.id);
      localStorage.setItem('selected_grant_title', data.title);
      navigate("/list-users");
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4">
        UIdaho Grant Management
      </Typography>
      <Typography variant="h6" gutterBottom>
        Create Grant
      </Typography>
      <Paper className={classes.form} component="form" onSubmit={handleSubmit}>
        <TextField
          label="Title"
          variant="outlined"
          className={classes.formField}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="Funding Agency"
          variant="outlined"
          className={classes.formField}
          value={fundingAgency}
          onChange={(e) => setFundingAgency(e.target.value)}
          required
        />
        <TextField
          label="Start Date"
          type="date"
          variant="outlined"
          className={classes.formField}
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
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
        <TextField
          label="Description"
          variant="outlined"
          className={classes.formField}
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submitButton}
        >
          Create Grant
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/grants")}
        >
          Back to Grants
        </Button>
      </Paper>
    </Container>
  );
}

export default CreateBudget;
