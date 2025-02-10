import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Transactions from './Components/Transactions';
import ViewTransactions from './Components/ViewTransactions';
import ListUsers from './Components/ListUsers';
import CreateUser from './Components/CreateUser';
// import { makeStyles } from '@mui/styles';

// const useStyles = makeStyles({
//   root: {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     width: '100vw',
//     textAlign: 'center',
//   }
// });

function App() {
  // const classes = useStyles();

  return (
    <Router>
    <div>
      <h1>GrantManagement</h1>

      <Link to="/transactions">Make Transaction</Link>
      <br />
      <Link to="/all-transactions">View transactions</Link>
      <br />
      <Link to="/users">Create users</Link>
      <br />
      <Link to="/list-users">List users</Link>
      <br />
      
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