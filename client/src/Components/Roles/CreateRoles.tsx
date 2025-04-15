import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';

const CreateRoles = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [grantId, setGrantId] = useState(localStorage.getItem("selected_grant_id"));
  const [userId, setUserId] = useState('');
  const [roleType, setRoleType] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/grant-roles/grant/${grantId}/user/${userId}?role_type=${roleType}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Role created successfully:', data);
      onClose();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create Role</DialogTitle>
      <DialogContent>
        <TextField
          label="Grant ID"
          value={grantId}
          onChange={(e) => setGrantId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Role Type"
          value={roleType}
          onChange={(e) => setRoleType(e.target.value)}
          select
          fullWidth
          margin="normal"
        >
          <MenuItem value="owner">Owner</MenuItem>
          <MenuItem value="editor">Editor</MenuItem>
          <MenuItem value="viewer">Viewer</MenuItem>
        </TextField>
        <TextField
          label="Permissions (comma-separated)"
          value={permissions.join(',')}
          onChange={(e) => setPermissions(e.target.value.split(','))}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoles;
