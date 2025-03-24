import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Button, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CreateRules = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [table, setTable] = useState('');
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/v1/rules/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Name: name,
        Description: description,
        Table: table,
        Enabled: enabled
      })
    });

    if (response.ok) {
      navigate('/rules');
    } else {
      console.error('Failed to create rule');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Create Rule
      </Typography>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Rule</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <form>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Table"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setEnabled(!enabled)}
            >
              {enabled ? 'Disable' : 'Enable'}
            </Button>
          </form>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Create Rule
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Conditions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Details about Rule 2.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Selectors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Details about Rule 3.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Details about Rule 4.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Container>
  );
}

export default CreateRules;
