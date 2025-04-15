import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';

const CreateCategories: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    is_active: true,
  });
  const [open, setOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/grant-categories/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', description: '', code: '', is_active: true });
        setOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Create Category
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Category</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              required
            />
            <TextField
              label="Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                />
              }
              label="Active"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default CreateCategories;
