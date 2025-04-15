import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rule } from '../../types/rules';
import { 
  Button, 
  CircularProgress, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  Typography 
} from '@mui/material';

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tempData: Rule[] = [
      {
        grant_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        name: "Sample Rule",
        description: "This is a sample rule for demonstration purposes.",
        rule_type: "expense",
        aggregator: "SUM",
        error_message: "Sample error message",
        is_active: true,
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        created_at: "2025-04-15T15:59:43.882Z",
        updated_at: "2025-04-15T15:59:43.882Z",
        created_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        filters: [
          {
            field: "amount",
            operator: ">",
            value: "1000",
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            created_at: "2025-04-15T15:59:43.882Z",
            updated_at: "2025-04-15T15:59:43.882Z",
          },
        ],
        conditions: [
          {
            field: "category",
            operator: "=",
            value: "travel",
            order: 1,
            id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            created_at: "2025-04-15T15:59:43.882Z",
            updated_at: "2025-04-15T15:59:43.882Z",
          },
        ],
      },
    ];
    setRules(tempData);
    setLoading(false);
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
        <div style={{ display: 'flex' }}>
          <List style={{ width: '40%' }}>
            {rules.map(rule => (
              <ListItem 
                button 
                key={rule.id} 
                onClick={() => setSelectedRule(rule)}
              >
                <ListItemText 
                  primary={rule.name} 
                  secondary={`${rule.description} (${rule.rule_type})`} 
                />
              </ListItem>
            ))}
          </List>
          <Drawer
            anchor="right"
            open={!!selectedRule}
            onClose={() => setSelectedRule(null)}
          >
            {selectedRule && (
              <div style={{ width: '400px', padding: '16px' }}>
                <Typography variant="h5" gutterBottom>
                  {selectedRule.name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong> {selectedRule.description}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Type:</strong> {selectedRule.rule_type}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Aggregator:</strong> {selectedRule.aggregator}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Error Message:</strong> {selectedRule.error_message}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Active:</strong> {selectedRule.is_active ? 'Yes' : 'No'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Created By:</strong> {selectedRule.created_by}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Created At:</strong> {new Date(selectedRule.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Updated At:</strong> {new Date(selectedRule.updated_at).toLocaleString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Filters:</strong>
                  {selectedRule.filters.map(filter => (
                    <div key={filter.id}>
                      {filter.field} {filter.operator} {filter.value} (Created At: {new Date(filter.created_at).toLocaleString()}, Updated At: {new Date(filter.updated_at).toLocaleString()})
                    </div>
                  ))}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Conditions:</strong>
                  {selectedRule.conditions.map(condition => (
                    <div key={condition.id}>
                      {condition.field} {condition.operator} {condition.value} (Order: {condition.order}, Created At: {new Date(condition.created_at).toLocaleString()}, Updated At: {new Date(condition.updated_at).toLocaleString()})
                    </div>
                  ))}
                </Typography>
              </div>
            )}
          </Drawer>
        </div>
      )}
    </Container>
  );
};

export default Rules;
