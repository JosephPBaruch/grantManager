import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useBackendHost } from '../../host';

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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const navigate = useNavigate();
  const backendHost = useBackendHost();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    const userData = {
      email,
      is_active: true,
      is_superuser: admin,
      full_name: fullName,
      password,
    };

    fetch(`http://${backendHost}:8000/api/v1/users/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    }).then((response) => {
      if (response.ok) {
        toast.success('User created successfully!');
        navigate("/users")
      } else {
        toast.error('Error creating user: ' + response.statusText);
        console.error('Error creating user:', response.statusText);
      }
    }).catch((error) => {
      toast.error('Error creating user: ' + error.message);
      console.error('Error creating user:', error);
    });
  };

  return (
    <Container maxWidth="sm">
      <Typography style={{paddingTop: '20px'}} variant="h4" component="h1" gutterBottom>
        Create User
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
      <ToastContainer />
    </Container>
  );
};

export default CreateUser;