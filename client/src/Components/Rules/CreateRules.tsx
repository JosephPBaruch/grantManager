import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Action, ActionsResponse } from '../../types/rules';

const CreateRules = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [table, setTable] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [ruleID, setRuleID] = useState(0);
  const [cid, setCID] = useState(0);
  const [conjunction, setConjunction] = useState('AND');

  useEffect(() => {
    const fetchActions = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/v1/rules/actions/?skip=0&limit=100', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: ActionsResponse = await response.json();
        setActions(data.data);
      } else {
        console.error('Failed to fetch actions');
      }
    };

    fetchActions();
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/v1/rules/actions', {
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

  const handleCreateAction = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/v1/rules/actions/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        RuleID: ruleID,
        CID: cid,
        Conjunction: conjunction
      })
    });

    if (response.ok) {
      const newAction: Action = await response.json();
      setActions([...actions, newAction]);
    } else {
      console.error('Failed to create action');
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
              placeholder='budget'
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
          <Typography>Actions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {actions.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>RuleID</TableCell>
                  <TableCell>CID</TableCell>
                  <TableCell>Conjunction</TableCell>
                  <TableCell>ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>{action.RuleID}</TableCell>
                    <TableCell>{action.CID}</TableCell>
                    <TableCell>{action.Conjunction}</TableCell>
                    <TableCell>{action.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No actions available</Typography>
          )}
          <form>
            <TextField
              label="RuleID"
              value={ruleID}
              onChange={(e) => setRuleID(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="CID"
              value={cid}
              onChange={(e) => setCID(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Conjunction"
              value={conjunction}
              onChange={(e) => setConjunction(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleCreateAction}>
              Create Action
            </Button>
          </form>
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
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Container>
  );
}

export default CreateRules;
