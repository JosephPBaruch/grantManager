import React, { useState } from 'react';
import { Button, TextField, Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";

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

const SignUp: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate("/sign-in");
    // fetch('http://127.0.0.1:8080/api/users/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
    // }).then((response) => {
    //   if (response.ok) {
    //     console.log('User signed up!');
    //     navigate("/sign-in");
    //   } else {
    //     console.error('Error signing up:', response.statusText);
    //   }
    // }).catch((error) => {
    //   console.error('Error signing up:', error);
    // });
  };

  return (
    <Container maxWidth="sm">
      <Typography style={{paddingTop: '20px'}} variant="h4" component="h1" gutterBottom>
        Sign Up
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
        <Button type="submit" variant="contained" color="primary" fullWidth className={classes.button}>
          Sign Up
        </Button>
      </form>
    </Container>
  );
};

export default SignUp;
