import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import Transactions from './Components/Expenses/CreateExpenses';
import ViewTransactions from './Components/Expenses/Expenses';
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
import Approvals from './Components/Approvals';
import Categories from './Components/Categories/Categories';
import Roles from './Components/Roles/Roles';

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
              UIGM {budgetName && `- ${budgetName}`}
            </Typography>
            {isAuthenticated && (
            <>
              <Button color="inherit">
                <Link to="/expenses" className={classes.link}>Expenses</Link>
              </Button>
              <Button color="inherit">
                <Link to="/approvals" className={classes.link}>Approvals</Link>
              </Button>
              <Button color="inherit">
                <Link to="/users" className={classes.link}>Users</Link>
              </Button>
              <Button color="inherit">
                <Link to="/roles" className={classes.link}>Roles</Link>
              </Button>
              <Button color="inherit">
                <Link to="/categories" className={classes.link}>Categories</Link>
              </Button>
              <Button color="inherit">
                <Link to="/rules" className={classes.link}>Rules</Link>
              </Button>
              <Button color="inherit">
                <Link to="/grants" className={classes.link}>Grant</Link>
              </Button>
              <Button variant="outlined" color="secondary" 
                // styles={{background}}
                onClick={handleSignOut}>
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
            <Route path="/sign-up" element={<SignUp />} />

            <Route path="/expenses" element={<ProtectedRoute element={<ViewTransactions />} />} />
            <Route path="/create-expenses" element={<ProtectedRoute element={<Transactions />} />} />
            
            <Route path="/users" element={<ProtectedRoute element={<ListUsers />} />} />
            <Route path="/create-users" element={<ProtectedRoute element={<CreateUser />} />} />

            <Route path="/grants" element={<ProtectedRoute element={<Budgets />} />} />
            <Route path="/create-grant" element={<ProtectedRoute element={<CreateBudget />} />} />

            <Route path="/rules" element={<ProtectedRoute element={<Rules />} />} />
            <Route path="/create-rules" element={<ProtectedRoute element={<CreateRules />} />} />

            <Route path="/approvals" element={<ProtectedRoute element={<Approvals />} />} />

            <Route path="/categories" element={<ProtectedRoute element={<Categories />} />} />

            <Route path="/roles" element={<ProtectedRoute element={<Roles />} />} />
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