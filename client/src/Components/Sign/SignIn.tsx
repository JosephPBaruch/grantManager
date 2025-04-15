import { Container, Typography, Paper, TextField, Button } from "@mui/material";
import { useState } from "react";
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
});

function SignIn() {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch('http://localhost:8000/api/v1/login/access-token', {
      method: 'POST',
      headers: new Headers({
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: new URLSearchParams({
        "grant_type": "password",
        "username": email,
        "password": password,
        "scope": "",
        "client_id": "",
        "client_secret": ""
      })
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error signing in: ' + response.statusText);
      }
    }).then((data) => {
      localStorage.setItem('access_token', data.access_token);
      toast.success('Signed in successfully!');
      navigate("/grants");
    }).catch((error) => {
      toast.error('Error signing in: ' + error.message);
      console.error('Error signing in:', error);
    });
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
        <Typography variant="h4">
            UIdaho Grant Management
        </Typography>
      <Typography variant="h6" gutterBottom>
        Sign In
      </Typography>
      <Paper className={classes.form} component="form" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          className={classes.formField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          className={classes.formField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.submitButton}
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          className={classes.submitButton}
          onClick={() => navigate("/sign-up")}
        >
          Sign Up
        </Button>
      </Paper>
      <ToastContainer />
    </Container>
  );
}

export default SignIn;
