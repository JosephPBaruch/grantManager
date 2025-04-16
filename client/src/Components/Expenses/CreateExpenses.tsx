import { Button, Container, TextField } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  textField: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});

function CreateExpenses() {
  const classes = useStyles();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [grantId, setGrantId] = useState(localStorage.getItem('selected_grant_id') || '');

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    fetch('http://localhost:8000/api/v1/grant-expenses/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        date,
        description,
        category,
        invoice_number: invoiceNumber,
        grant_id: grantId,
      }),
    })
      .then(async (response) => {
        if (response.ok) {
          toast.success('Expense created!');
        } else {
          const errorData = await response.json();
          toast.error(errorData.detail || 'Failed to create expense');
        }
      })
      .catch((error) => {
        console.error('Error creating expense:', error);
      });
  };

  return (
    <Container maxWidth="sm">
      <form className={classes.form}>
        <TextField
          label="Amount"
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className={classes.textField}
        />
        <TextField
          label="Date"
          type="datetime-local"
          variant="outlined"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={classes.textField}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={classes.textField}
        />
        <TextField
          label="Category"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className={classes.textField}
        />
        <TextField
          label="Invoice Number"
          variant="outlined"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          required
          className={classes.textField}
        />
        <TextField
          label="Grant ID"
          variant="outlined"
          value={grantId}
          onChange={(e) => setGrantId(e.target.value)}
          required
          className={classes.textField}
        />
        <Button onClick={onClick} type="submit" variant="contained" color="primary" className={classes.button}>
          Create Expense
        </Button>
      </form>
    <ToastContainer />
    </Container>
  );
}

export default CreateExpenses;