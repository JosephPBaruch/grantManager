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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch('http://localhost:8000/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, full_name: fullName }),
    }).then((response) => {
      if (response.ok) {
        console.log('User signed up!');
        navigate("/");
      } else {
        console.error('Error signing up:', response.statusText);
      }
    }).catch((error) => {
      console.error('Error signing up:', error);
    });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4">
        UIdaho Grant Management
      </Typography>
      <Typography style={{paddingTop: '20px'}} variant="h6" component="h1" gutterBottom>
        Sign Up
      </Typography>
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
