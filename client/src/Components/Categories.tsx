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

});

function Categories() {
    const classes = useStyles();

  return (
    <Container maxWidth="sm" className={classes.root}>
         <Container maxWidth="sm" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Categories
      </Typography>
     
    </Container>
    </Container>
  );
}

export default Categories;
