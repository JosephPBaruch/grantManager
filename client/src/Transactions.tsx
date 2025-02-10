import { Button, Container, TextField, Typography } from "@mui/material";
import { useState } from "react";

function Transactions() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fetch('http://127.0.0.1:8080/api/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, description }), // user needs to be set somehow through a sign in session or something
    }).then((response) => {
      if (response.ok) {
        console.log('User created!');
      }
    });
  };

  return (
    <Container>
    <Typography variant="h1">Transactions</Typography>
    <form>
      <div>
        <TextField
          label="amount"
          variant="outlined"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <TextField
          label="description"
          type="description"
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <Button onClick={onClick} type="submit" variant="contained" color="primary">
        Create User
      </Button>
    </form>
  </Container>

  );
}

export default Transactions;