import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Action, ActionsResponse, Rule, RulesResponse, Condition, ConditionsResponse, Selector, SelectorsResponse } from '../../types/rules';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateRules = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [table, setTable] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [selectors, setSelectors] = useState<Selector[]>([]);
  const [ruleID, setRuleID] = useState(0);
  const [cid, setCID] = useState(0);
  const [conjunction, setConjunction] = useState('AND');
  const [leftSID, setLeftSID] = useState(0);
  const [operator, setOperator] = useState('');
  const [rightSID, setRightSID] = useState(0);
  const [selectorTable, setSelectorTable] = useState('');
  const [target, setTarget] = useState('');
  const [aggregator, setAggregator] = useState('MAX');
  const [type, setType] = useState('int');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/v1/rules/?skip=0&limit=100', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data: RulesResponse = await response.json();
        if (data && data.data) {
          setRules(data.data);
        } else {
          setRules([]);
        }
      } catch (error) {
        console.error('Failed to fetch rules:', error);
        setRules([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchActions = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/v1/rules/actions/?skip=0&limit=100', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data: ActionsResponse = await response.json();
        if (data && data.data) {
          setActions(data.data);
        } else {
          setActions([]);
        }
      } catch (error) {
        console.error('Failed to fetch actions:', error);
        setActions([]);
      }
    };

    const fetchConditions = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/v1/rules/conditions/?skip=0&limit=100', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data: ConditionsResponse = await response.json();
        if (data && data.data) {
          setConditions(data.data);
        } else {
          setConditions([]);
        }
      } catch (error) {
        console.error('Failed to fetch conditions:', error);
        setConditions([]);
      }
    };

    const fetchSelectors = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/v1/rules/selectors/?skip=0&limit=100', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data: SelectorsResponse = await response.json();
        if (data && data.data) {
          setSelectors(data.data);
        } else {
          setSelectors([]);
        }
      } catch (error) {
        console.error('Failed to fetch selectors:', error);
        setSelectors([]);
      }
    };

    fetchRules();
    fetchActions();
    fetchConditions();
    fetchSelectors();
  }, []);

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
      toast.success('Rule created successfully');
      navigate('/rules');
    } else {
      toast.error('Failed to create rule');
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
      toast.success('Action created successfully');
    } else {
      toast.error('Failed to create action');
      console.error('Failed to create action');
    }
  };

  const handleCreateCondition = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/v1/rules/conditions/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        LeftSID: leftSID,
        Operator: operator,
        RightSID: rightSID
      })
    });

    if (response.ok) {
      const newCondition: Condition = await response.json();
      setConditions([...conditions, newCondition]);
      toast.success('Condition created successfully');
    } else {
      toast.error('Failed to create condition');
      console.error('Failed to create condition');
    }
  };

  const handleCreateSelector = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8000/api/v1/rules/selectors/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        Table: selectorTable,
        Target: target,
        Aggregator: aggregator,
        Type: type
      })
    });

    if (response.ok) {
      const newSelector: Selector = await response.json();
      setSelectors([...selectors, newSelector]);
      toast.success('Selector created successfully');
    } else {
      toast.error('Failed to create selector');
      console.error('Failed to create selector');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="md">
      <ToastContainer />
      <Typography variant="h4" component="h1" gutterBottom>
        Create Rule
      </Typography>
     
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Rule</Typography>
        </AccordionSummary>
        <AccordionDetails>
        {rules.length === 0 ? (
        <Typography variant="body1">No rules available.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Table</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell>RuleID</TableCell>
              <TableCell>Trigger</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.RuleID}>
                <TableCell>{rule.Name}</TableCell>
                <TableCell>{rule.Description}</TableCell>
                <TableCell>{rule.Table}</TableCell>
                <TableCell>{rule.Enabled ? 'Yes' : 'No'}</TableCell>
                <TableCell>{rule.RuleID}</TableCell>
                <TableCell>{rule.Trigger}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
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
          {conditions.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ConditionID</TableCell>
                  <TableCell>RuleID</TableCell>
                  <TableCell>LeftSID</TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>RightSID</TableCell>
                  <TableCell>CID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conditions.map((condition) => (
                  <TableRow key={condition.CID}>
                    <TableCell>{condition.LeftSID}</TableCell>
                    <TableCell>{condition.Operator}</TableCell>
                    <TableCell>{condition.RightSID}</TableCell>
                    <TableCell>{condition.CID}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No conditions available</Typography>
          )}
          <form>
            <TextField
              label="LeftSID"
              value={leftSID}
              onChange={(e) => setLeftSID(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Operator"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="RightSID"
              value={rightSID}
              onChange={(e) => setRightSID(Number(e.target.value))}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleCreateCondition}>
              Create Condition
            </Button>
          </form>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Selectors</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {selectors.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Table</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Aggregator</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>SID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectors.map((selector) => (
                  <TableRow key={selector.SID}>
                    <TableCell>{selector.Table}</TableCell>
                    <TableCell>{selector.Target}</TableCell>
                    <TableCell>{selector.Aggregator}</TableCell>
                    <TableCell>{selector.Type}</TableCell>
                    <TableCell>{selector.SID}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No selectors available</Typography>
          )}
          <form>
            <TextField
              label="Table"
              value={selectorTable}
              onChange={(e) => setSelectorTable(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Aggregator"
              value={aggregator}
              onChange={(e) => setAggregator(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleCreateSelector}>
              Create Selector
            </Button>
          </form>
        </AccordionDetails>
      </Accordion>
      {/* <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button> */}
    </Container>
  );
}

export default CreateRules;
