import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from "react";
import { Role } from "../../types/Roles";
import CreateRoles from "./CreateRoles";
import { useBackendHost } from "../../host";

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  tableContainer: {
    marginTop: '20px',
    maxWidth: '800px',
  },
});

function Roles() {
  const classes = useStyles();
  const [roles, setRoles] = useState<Role[]>([]); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const backendHost = useBackendHost();

  const fetchRoles = async () => {
    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/grant-roles/grant/${localStorage.getItem("selected_grant_id")}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRoles(data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDialogOpen = () => setIsDialogOpen(true);
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    fetchRoles();
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Typography variant="h4">
        Roles
      </Typography>
      <Button variant="contained" color="primary" onClick={handleDialogOpen}>
        Create Role
      </Button>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Grant ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Role Type</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Updated At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.grant_id}</TableCell>
                <TableCell>{role.user_id}</TableCell>
                <TableCell>{role.role_type}</TableCell>
                <TableCell>{role.permissions.join(", ")}</TableCell>
                <TableCell>{new Date(role.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(role.updated_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <CreateRoles open={isDialogOpen} onClose={handleDialogClose} />
    </Container>
  );
}

export default Roles;
