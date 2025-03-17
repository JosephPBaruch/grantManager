import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import Transactions from './Components/MakeTransactions';
import ViewTransactions from './Components/ListTransaction';
import ListUsers from './Components/ListUsers';
import CreateUser from './Components/CreateUser';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Container } from '@mui/material';
import SignIn from './Components/SignIn';
import CreateBudget from './Components/CreateBudget';
import Budgets from './Components/Budgets';
import SignUp from './Components/SignUp';
import ProtectedRoute from './Components/ProtectedRoute';
import { useState } from 'react';

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
  return (
    <Router>
      <CssBaseline />
      <LocationBasedComponents />
    </Router>
  );
}

function LocationBasedComponents() {
  const location = useLocation();
  const navigate = useNavigate();
  const classes = useStyles();
  const hideHeaderFooter = ['/', '/sign-up', '/create-budget', '/budgets'].includes(location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Example state for authentication

  const handleSignOut = () => {
    setIsAuthenticated(false);
    navigate("/")
    // Add sign-out logic here
  };

  return (
    <>
      {!hideHeaderFooter && (
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
            {isAuthenticated && (
              <>
                <Button color="inherit">
                  <Link to="/create-budget" className={classes.link}>Change Budget</Link>
                </Button>
                <Button color="inherit" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}
      <div className={classes.root}>
        <div className={classes.content}>
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
            <Route path="/list-transactions" element={<ProtectedRoute element={<ViewTransactions />} />} />
            {/* <Route path="/list-transactions" element={<ViewTransactions />} /> */}
            <Route path="/list-users" element={<ProtectedRoute element={<ListUsers />} />} />
            <Route path="/users" element={<ProtectedRoute element={<CreateUser />} />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/create-budget" element={<ProtectedRoute element={<CreateBudget />} />} />
            <Route path="/budgets" element={<ProtectedRoute element={<Budgets />} />} />
          </Routes>
        </div>
        {!hideHeaderFooter && (
          <footer className={classes.footer}>
            <Container maxWidth="sm">
              <Typography variant="body1">GrantManagement © 2023</Typography>
              <Typography variant="body2">Contact: info@grantmanagement.com</Typography>
            </Container>
          </footer>
        )}
      </div>
    </>
  );
}

export default App;