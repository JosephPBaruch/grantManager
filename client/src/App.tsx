import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import Transactions from './Components/Transactions/MakeTransactions';
import ViewTransactions from './Components/Transactions/ListTransaction';
import ListUsers from './Components/Users/ListUsers';
import CreateUser from './Components/Users/CreateUser';
import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar, Typography, Button, CssBaseline, Container } from '@mui/material';
import SignIn from './Components/Sign/SignIn';
import CreateBudget from './Components/Grants/CreateGrants';
import Budgets from './Components/Grants/Grants';
import SignUp from './Components/Sign/SignUp';
import Rules from './Components/Rules/Rules'
import ProtectedRoute from './Components/ProtectedRoute';
import { useState, useEffect } from 'react';
import CreateRules from './Components/Rules/CreateRules';

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
      color: '#ffcc00', 
    },
    '&:active': {
      color: '#ff9900', 
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [budgetName, setBudgetName] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    setIsAuthenticated(!!accessToken);
    const storedBudgetName = localStorage.getItem('selected_grant_title');
    setBudgetName(storedBudgetName || '');
  }, [location]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <>
      {!hideHeaderFooter && (
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              UIdaho Grant Management {budgetName && `- ${budgetName}`}
            </Typography>
            <Button color="inherit">
              <Link to="/list-transactions" className={classes.link}>Transactions</Link>
            </Button>
            <Button color="inherit">
              <Link to="/list-users" className={classes.link}>Users</Link>
            </Button>
            {isAuthenticated && (
              <>
              <Button color="inherit">
                  <Link to="/rules" className={classes.link}>Rules</Link>
                </Button>
                <Button color="inherit">
                  <Link to="/grants" className={classes.link}>Grant</Link>
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
            <Route path="/list-transactions" element={<ViewTransactions />} />
            <Route path="/list-users" element={<ProtectedRoute element={<ListUsers />} />} />
            <Route path="/users" element={<ProtectedRoute element={<CreateUser />} />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/create-grant" element={<ProtectedRoute element={<CreateBudget />} />} />
            <Route path="/grants" element={<ProtectedRoute element={<Budgets />} />} />
            <Route path="/rules" element={<ProtectedRoute element={<Rules />} />} />
            <Route path="/create-rules" element={<ProtectedRoute element={<CreateRules />} />} />
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