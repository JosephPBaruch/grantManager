import { Container, Typography, } from "@mui/material";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  budgetCard: {
    padding: '20px',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '10px',
  },
  budgetInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  createButton: {
    marginTop: '20px',
  },
});

function Roles() {
  const classes = useStyles();
 
  return (
    <Container maxWidth="sm" className={classes.root}>
        <Typography variant="h4">
            Roles
        </Typography>
    </Container>
  );
}

export default Roles;
