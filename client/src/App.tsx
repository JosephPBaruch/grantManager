import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Transactions from './Components/MakeTransactions';
import ViewTransactions from './Components/ListTransaction';
import ListUsers from './Components/ListUsers';
import CreateUser from './Components/CreateUser';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Container } from '@mui/material';
import SignIn from './Components/SignIn';
import CreateBudget from './Components/CreateBudget';
import Budgets from './Components/Budgets';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100vh',
    width: '100vw',
    textAlign: 'center',
    marginTop: '64px',
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
    '&:hover': {
      color: '#ffcc00', // Change to desired hover color
    },
    '&:active': {
      color: '#ff9900', // Change to desired active color
    },
  },
  title: { 
    flexGrow: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  footer: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
});

function App() {
  const classes = useStyles();

  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            UIdaho Grant Management
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
        <div className={classes.content}>
          <Routes>
            <Route path="/" element={<h1>Home</h1>} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/list-transactions" element={<ViewTransactions />} />
            <Route path="/list-users" element={<ListUsers />} />
            <Route path="/users" element={<CreateUser />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/create-budget" element={<CreateBudget />} />
            <Route path="/budgets" element={<Budgets />} />
          </Routes>
        </div>
        <footer className={classes.footer}>
          <Container maxWidth="sm">
            <Typography variant="body1">GrantManagement © 2023</Typography>
            <Typography variant="body2">Contact: info@grantmanagement.com</Typography>
          </Container>
        </footer>
      </div>
    </Router>
  );
}

export default App;