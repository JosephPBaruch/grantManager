import { Container, Typography, Paper, TextField, Button } from "@mui/material";
import { useState } from "react";
import { makeStyles } from '@mui/styles';

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Fetch Here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
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
      </Paper>
    </Container>
  );
}

export default SignIn;
