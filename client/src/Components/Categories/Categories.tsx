import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";
import { Category } from "../../types/Categories";
import CreateCategories from "./CreateCategories"; 
import { useBackendHost } from "../../host";

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
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const backendHost = useBackendHost();
  const accessToken = localStorage.getItem('access_token');


  if (!accessToken) {
    console.error('No access token found');
    // return;
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(`http://${backendHost}:8000/api/v1/grant-categories/?skip=0&limit=100`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
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

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedCategory(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCategory(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedCategory) {
      try {
        await fetch(`http://${backendHost}:8000/api/v1/grant-categories/${selectedCategory.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
          
        });
        setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
    handleCloseDeleteDialog();
  };

  const handleSaveEdit = async () => {
    if (selectedCategory) {
      try {
        const response = await fetch(`http://${backendHost}:8000/api/v1/grant-categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(selectedCategory),
        });
        if (response.ok) {
          const updatedCategory = await response.json();
          setCategories(categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)));
        } else {
          console.error("Error updating category:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
    handleCloseEditDialog();
  };

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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.code}</TableCell>
                <TableCell>{category.is_active ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary" onClick={() => handleEditClick(category)}>
                    Edit
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => handleDeleteClick(category)} style={{ marginLeft: '10px' }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={selectedCategory?.name || ""}
            onChange={(e) => setSelectedCategory({ ...selectedCategory!, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={selectedCategory?.description || ""}
            onChange={(e) => setSelectedCategory({ ...selectedCategory!, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Code"
            type="text"
            fullWidth
            value={selectedCategory?.code || ""}
            onChange={(e) => setSelectedCategory({ ...selectedCategory!, code: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Active"
            type="text"
            fullWidth
            value={selectedCategory?.is_active ? "Yes" : "No"}
            onChange={(e) => setSelectedCategory({ ...selectedCategory!, is_active: e.target.value === "Yes" })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{selectedCategory?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Categories;
