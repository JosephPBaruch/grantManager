import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';

type User = {
  id: string;
  full_name: string;
};

const CreateRoles = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [grantId, setGrantId] = useState(localStorage.getItem("selected_grant_id"));
  const [userId, setUserId] = useState('');
  const [roleType, setRoleType] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [users, setUsers] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/users/?skip=0&limit=100', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Fetched data:", data);
  
        if (data && Array.isArray(data.data) && data.data.length > 0) {
          const firstUser = data.data[0];
          console.log("First data:", firstUser);
          await setUsers({ id: firstUser.id, full_name: firstUser.full_name });
        } else {
          console.error("No users or bad format:", data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    fetchUsers();
  }, []);
  

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
      console.log(users);
      const data = await response.json();
      console.log('Role created successfully:', data);
      onClose();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
        //   select
          fullWidth
          margin="normal"
        >
          {/* {users && (
            <MenuItem key={users.id} value={users.id}>
              {users.full_name}
            </MenuItem>
          )} */}
        </TextField>
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
