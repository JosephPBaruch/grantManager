import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

interface User {
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name: string;
  id: string;
}

interface EditUserProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const EditUser: React.FC<EditUserProps> = ({ userId, open, onClose, onSave }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      // Fetch user data when dialog opens
      setLoading(true);
      fetch(`http://localhost:8000/api/v1/users/${userId}`, 
        {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
    }
      )
        .then((response) => response.json())
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, userId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: keyof User, value: any) => {
    if (user) {
      setUser({ ...user, [field]: value });
    }
  };

  const handleSave = () => {
    if (user) {
      onSave(user);
    }
  };

  if (loading) {
    return null; // Optionally, show a loading spinner
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {user && (
          <>
            <TextField
              label="Email"
              value={user.email}
              onChange={(e) => handleChange("email", e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Full Name"
              value={user.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.is_superuser}
                  onChange={(e) => handleChange("is_superuser", e.target.checked)}
                />
              }
              label="Superuser"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" disabled={!user}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUser;
