import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";
import { Category } from "../../types/Categories";
import CreateCategories from "./CreateCategories"; 

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  table: {
    minWidth: 650,
  },
});

function Categories() {
  const classes = useStyles();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:8000/api/v1/grant-categories/?skip=0&limit=100', {
          headers: {
            'accept': 'application/json',
          }
        });
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, []);

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Typography variant="h4" component="h1" gutterBottom>
        Categories
      </Typography>
      <CreateCategories />
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="categories table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.code}</TableCell>
                <TableCell>{category.is_active ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Categories;
