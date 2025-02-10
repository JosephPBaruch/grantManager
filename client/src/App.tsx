import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Transactions from './Components/Transactions';
import ViewTransactions from './Components/ViewTransactions';
import ListUsers from './Components/ListUsers';
import CreateUser from './Components/CreateUser';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100vw',
    textAlign: 'center',
  },
  appBar: {
    marginBottom: '20px',
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
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            GrantManagement
          </Typography>
          <Button color="inherit">
            <Link to="/transactions" className={classes.link}>Make Transaction</Link>
          </Button>
          <Button color="inherit">
            <Link to="/all-transactions" className={classes.link}>View Transactions</Link>
          </Button>
          <Button color="inherit">
            <Link to="/users" className={classes.link}>Create Users</Link>
          </Button>
          <Button color="inherit">
            <Link to="/list-users" className={classes.link}>List Users</Link>
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/all-transactions" element={<ViewTransactions />} />
          <Route path="/list-users" element={<ListUsers />} />
          <Route path="/users" element={<CreateUser />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;