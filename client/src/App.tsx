import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Transactions from './Components/MakeTransactions';
import ViewTransactions from './Components/ListTransaction';
import ListUsers from './Components/ListUsers';
import CreateUser from './Components/CreateUser';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button, CssBaseline } from '@mui/material';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100vw',
    textAlign: 'center',
    marginTop: '64px', // Adjust for AppBar height
  },
  appBar: {
    marginBottom: '20px',
    position: 'fixed',
    top: 0,
    width: '100%',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    marginRight: '15px',
  },
  title: { 
    flexGrow: 1,
  }
});

function App() {
  const classes = useStyles();

  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            GrantManagement
          </Typography>
          <Button color="inherit">
            <Link to="/transactions" className={classes.link}>Make Transaction</Link>
          </Button>
          <Button color="inherit">
            <Link to="/list-transactions" className={classes.link}>Transactions</Link>
          </Button>
          <Button color="inherit">
            <Link to="/users" className={classes.link}>Create Users</Link>
          </Button>
          <Button color="inherit">
            <Link to="/list-users" className={classes.link}>Users</Link>
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/list-transactions" element={<ViewTransactions />} />
          <Route path="/list-users" element={<ListUsers />} />
          <Route path="/users" element={<CreateUser />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;