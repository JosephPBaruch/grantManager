import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import EditUser from "./EditUser"; // Import the EditUser component
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  userCard: {
    padding: '20px',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '10px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
});

function ListUsers() {
  const classes = useStyles();
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editCurrentUserDialogOpen, setEditCurrentUserDialogOpen] = useState(false);
  const [deleteCurrentUserDialogOpen, setDeleteCurrentUserDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleEditClick = (userId: string) => {
    setSelectedUserId(userId);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedUserId(null);
  };

  const handleSave = (updatedUser: User) => {
    // Update the user in the list after saving
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    handleEditClose();
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      toast.error('No access token found');
      return;
    }

    fetch(`http://localhost:8000/api/v1/users/${userToDelete}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete));
        toast.success('User deleted successfully');
      } else {
        console.error('Failed to delete user');
        toast.error('Failed to delete user');
      }
    })
    .catch((error) => {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    })
    .finally(() => {
      handleDeleteClose();
    });
  };

  const handleDeleteCurrentUser = () => {
    setDeleteCurrentUserDialogOpen(true);
  };

  const handleDeleteCurrentUserClose = () => {
    setDeleteCurrentUserDialogOpen(false);
  };

  const handleDeleteCurrentUserConfirm = () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      toast.error('No access token found');
      return;
    }

    fetch('http://localhost:8000/api/v1/users/me', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      if (response.ok) {
        setCurrentUser(null);
        console.log('Current user deleted successfully');
        toast.success('Your account has been deleted successfully');
      } else {
        console.error('Failed to delete current user');
        toast.error('Failed to delete your account');
      }
    })
    .catch((error) => {
      console.error('Error deleting current user:', error);
      toast.error('Error deleting your account');
    })
    .finally(() => {
      handleDeleteCurrentUserClose();
    });
  };

  const handleEditCurrentUserClick = () => {
    setEditCurrentUserDialogOpen(true);
  };

  const handleEditCurrentUserClose = () => {
    setEditCurrentUserDialogOpen(false);
  };

  const handleSaveCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    handleEditCurrentUserClose();
  };

  const handlePasswordDialogOpen = () => {
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handlePasswordUpdate = () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      toast.error('No access token found');
      return;
    }

    fetch('http://localhost:8000/api/v1/users/me/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
    .then((response) => {
      if (response.ok) {
        console.log('Password updated successfully');
        toast.success('Password updated successfully');
        handlePasswordDialogClose();
      } else {
        console.error('Failed to update password');
        toast.error('Failed to update password');
      }
    })
    .catch((error) => {
      console.error('Error updating password:', error);
      toast.error('Error updating password');
    });
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      toast.error('No access token found');
      return;
    }

    // Fetch current user data
    fetch('http://localhost:8000/api/v1/users/me', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      setCurrentUser(data);
      // toast.success('Current user data fetched successfully');
    })
    .catch((error) => {
      console.error('Error fetching current user:', error);
      toast.error('Error fetching current user');
    });

    // Fetch all users
    fetch('http://localhost:8000/api/v1/users/?skip=0&limit=100', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
    .then((response) => response.json())
    .then((data) => {
      console.log(data.data);
      setUsers(data.data);
      // toast.success('Users fetched successfully');
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    });
  }, []);

  return (
    <Container maxWidth="md" className={classes.root}>
      <ToastContainer />
      <Typography variant="h4" component="h1" gutterBottom>
        Current User
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handlePasswordDialogOpen}
        style={{ marginBottom: '20px' }}
      >
        Update Password
      </Button>
      {currentUser && (
        <TableContainer component={Paper} style={{ marginBottom: '20px' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Superuser</TableCell>
                <TableCell>Edit</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{currentUser.full_name}</TableCell>
                <TableCell>{currentUser.email}</TableCell>
                <TableCell>{new Date(currentUser.created_at).toLocaleString()}</TableCell>
                <TableCell>{currentUser.is_active ? <Check /> : <Close />}</TableCell>
                <TableCell>{currentUser.is_superuser ? <Check /> : <Close />}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleEditCurrentUserClick}
                  >
                    Edit
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleDeleteCurrentUser}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {editCurrentUserDialogOpen && (
        <EditUser
          userId="me"
          open={editCurrentUserDialogOpen}
          onClose={handleEditCurrentUserClose}
          onSave={handleSaveCurrentUser}
          isCurrentUser={true}
        />
      )}
      <Dialog open={deleteCurrentUserDialogOpen} onClose={handleDeleteCurrentUserClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCurrentUserClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteCurrentUserConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordDialogOpen} onClose={handlePasswordDialogClose}>
        <DialogTitle>Update Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your current password and the new password you want to set.
          </DialogContentText>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handlePasswordUpdate} color="secondary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h4" component="h1" gutterBottom>
        Users
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/users')}>
        Create User
      </Button>
      {users ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Superuser</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                  <TableCell>{user.is_active ? <Check /> : <Close />}</TableCell>
                  <TableCell>{user.is_superuser ? <Check /> : <Close />}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditClick(user.id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteClick(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No users found.</Typography>
      )}
      {selectedUserId && (
        <EditUser
          userId={selectedUserId}
          open={editDialogOpen}
          onClose={handleEditClose}
          onSave={handleSave}
        />
      )}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ListUsers;
