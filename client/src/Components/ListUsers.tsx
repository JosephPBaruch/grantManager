import { Container, Typography, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { makeStyles } from '@mui/styles';
import { User } from "../types/User";

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
      setUsers(data);
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
      {users.length > 0 ? (
        users.map((user) => (
          <Paper style={{backgroundColor: "#e0e0e0" }} key={user.id} className={classes.userCard}>
            <div className={classes.userInfo}>
              <Typography variant="h6">{user.first_name} {user.last_name}</Typography>
              <Typography variant="body1">{user.email}</Typography>
              <Typography variant="body2">{new Date(user.created_at).toLocaleString()}</Typography>
              <Typography variant="body2">Admin: {user.admin ? "Yes" : "No"}</Typography>
              <Typography variant="body2">Budget Name: {user.budgetName}</Typography>
            </div>
          </Paper>
        ))
      ) : (
        <Typography variant="body1">No users found.</Typography>
      )}
    </Container>
  );
}

export default ListUsers;
