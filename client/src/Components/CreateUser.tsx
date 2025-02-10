import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Checkbox, FormControlLabel } from '@mui/material';

const CreateUser: React.FC = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [admin, setAdmin] = useState(false);
    const [budgetName, setBudgetName] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetch('http://127.0.0.1:8080/api/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, admin, budgetName }),
        }).then((response) => {
            if (response.ok) {
                console.log('User created!');
            } else {
                console.error('Error creating user:', response.statusText);
            }
        }).catch((error) => {
            console.error('Error creating user:', error);
        });
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" component="h1" gutterBottom>
                Create User
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Budget Name"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={admin}
                            onChange={(e) => setAdmin(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Admin"
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Create User
                </Button>
            </form>
        </Container>
    );
};

export default CreateUser;