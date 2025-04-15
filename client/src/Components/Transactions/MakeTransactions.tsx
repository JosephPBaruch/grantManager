import { Button, Container, TextField } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useState } from "react";

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

function Transactions() {
  const classes = useStyles();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fetch('http://127.0.0.1:8080/api/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description, user: 1 }), // user needs to be set somehow through a sign in session or something
    }).then((response) => {
      if (response.ok) {
        console.log('Transaction created!');
      }
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
          label="Description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={classes.textField}
        />
        <Button onClick={onClick} type="submit" variant="contained" color="primary" className={classes.button}>
          Create Transaction
        </Button>
      </form>
    </Container>
  );
}

export default Transactions;