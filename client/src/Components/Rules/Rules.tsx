import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rule } from '../../types/rules';
import { Button, CircularProgress, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRules = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:8000/api/v1/rules/?skip=0&limit=100', {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data && data.data) {
          setRules(data.data);
        } else {
          setRules([]);
        }
      } catch (error) {
        console.error('Error fetching rules:', error);
        setRules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Rules
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/create-rules')}>
        Create Rule
      </Button>
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
            {rules.map(rule => (
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
    </Container>
  );
};

export default Rules;
