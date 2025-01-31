import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100vw',
    textAlign: 'center',
  }
});

function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <h1>Grant Budget Manager</h1>
    </div>
  );
}

export default App;