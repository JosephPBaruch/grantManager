import { Container, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { User } from "../types/User";

function ListUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/users/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
    <Container>
      <Typography variant="h1">Users</Typography>
      {/* List all of the users here */}
      {users.map((user) => (
        <div key={user.id}>
          <Typography variant="body1">{user.first_name} {user.last_name}</Typography>
          <Typography variant="body2">{user.email}</Typography>
          <Typography variant="body2">{new Date(user.created_at).toLocaleString()}</Typography>
          <Typography variant="body2">Admin: {user.admin ? "Yes" : "No"}</Typography>
          <Typography variant="body2">Budget Name: {user.budgetName}</Typography>
        </div>
      ))}
    </Container>
  );
}

export default ListUsers;
