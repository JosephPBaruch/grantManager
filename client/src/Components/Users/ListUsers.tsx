import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import EditUser from "./EditUser"; // Import the EditUser component

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

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

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
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
    });
  }, []);

  return (
    <Container maxWidth="sm" className={classes.root}>
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
    </Container>
  );
}

export default ListUsers;
