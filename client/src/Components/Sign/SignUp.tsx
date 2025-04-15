import React, { useState } from 'react';
import { Button, TextField, Container, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";
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
      headers: new Headers({'content-type': 'application/json'}),

      body: JSON.stringify({ "email": email, "password": password, "full_name": fullName }),
      // mode: 'no-cors', 
    }).then((response) => {
      if (response.ok) {
        console.log('User signed up!');
        toast.success('Signed up successfully!');
        navigate("/");
      } else {
        console.error('Error signing up:', response.statusText);
        toast.error('Error signing up: ' + response.statusText);
      }
    }).catch((error) => {
      console.error('Error signing up:', error);
      toast.error('Error signing up: ' + error.message);
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
        <Button variant="outlined" color="secondary" fullWidth className={classes.button} onClick={() => navigate("/")}>
          Sign In
        </Button>
      </form>
      <ToastContainer />
    </Container>
  );
};

export default SignUp;
