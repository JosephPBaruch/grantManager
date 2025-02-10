import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Transactions from './Transactions';
import ViewTransactions from './ViewTransactions';
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
      <Routes>
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/all-transactions" element={<ViewTransactions />} />
        <Route path="/" element={<h1>Home</h1>} />
      </Routes>
    </div>
  </Router>
  );
}

export default App;