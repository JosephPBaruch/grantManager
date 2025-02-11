import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';

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

const CreateUser: React.FC = () => {
  const classes = useStyles();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [budgetName, setBudgetName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch('http://127.0.0.1:8080/api/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, admin, budgetName }),
    }).then((response) => {
      if (response.ok) {
        console.log('User created!');
      } else {
        console.error('Error creating user:', response.statusText);
      }
    }).catch((error) => {
      console.error('Error creating user:', error);
    });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Create User
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
          margin="normal"
          required
          className={classes.textField}
        />
        <TextField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
          margin="normal"
          required
          className={classes.textField}
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          className={classes.textField}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
          className={classes.textField}
        />
        <TextField
          label="Budget Name"
          value={budgetName}
          onChange={(e) => setBudgetName(e.target.value)}
          fullWidth
          margin="normal"
          className={classes.textField}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={admin}
              onChange={(e) => setAdmin(e.target.checked)}
              color="primary"
            />
          }
          label="Admin"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth className={classes.button}>
          Create User
        </Button>
      </form>
    </Container>
  );
};

export default CreateUser;