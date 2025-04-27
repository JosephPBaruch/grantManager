import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rule } from '../../types/rules';
import { 
  Button, 
  CircularProgress, 
  Container, 
  Drawer, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import CreateTemplateRule from './CreateTemplateRule';
import { useBackendHost } from '../../host';

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<Rule | null>(null);
  const navigate = useNavigate();
  const backendHost = useBackendHost();

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch(`http://${backendHost}:8000/api/v1/rules/?skip=0&limit=100`, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch rules');
        }

        const result = await response.json();
        console.log(result);
        if (result && Array.isArray(result.data)) {
          setRules(result.data); // Access the `data` property of the response
        } else {
          console.error('Unexpected response format:', result);
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

  const toggleDrawer = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  const handleDeleteClick = (rule: Rule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/rules/${ruleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete rule');
      }

      setRules(rules.filter(rule => rule.id !== ruleToDelete.id));
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRuleToDelete(null);
  };

  const handleEditClick = (rule: Rule) => {
    setRuleToEdit(rule);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!ruleToEdit) return;

    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/rules/${ruleToEdit.id}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ruleToEdit),
      });

      if (!response.ok) {
        throw new Error('Failed to update rule');
      }

      const updatedRule = await response.json();
      setRules(rules.map(rule => (rule.id === updatedRule.id ? updatedRule : rule)));
      setEditDialogOpen(false);
      setRuleToEdit(null);
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setRuleToEdit(null);
  };

  const handleFilterChange = (index: number, field: string, value: string) => {
    if (!ruleToEdit) return;
    const updatedFilters = [...ruleToEdit.filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setRuleToEdit({ ...ruleToEdit, filters: updatedFilters });
  };

  const handleConditionChange = (index: number, field: string, value: string) => {
    if (!ruleToEdit) return;
    const updatedConditions = [...ruleToEdit.conditions];
    updatedConditions[index] = { ...updatedConditions[index], [field]: value };
    setRuleToEdit({ ...ruleToEdit, conditions: updatedConditions });
  };

  const addFilter = () => {
    if (!ruleToEdit) return;
    const newFilter = { field: '', operator: '=', value: '', id: '', created_at: '', updated_at: '' };
    setRuleToEdit({ ...ruleToEdit, filters: [...ruleToEdit.filters, newFilter] });
  };

  const addCondition = () => {
    if (!ruleToEdit) return;
    const newCondition = { field: '', operator: '=', value: '', order: 0, id: '', created_at: '', updated_at: '' };
    setRuleToEdit({ ...ruleToEdit, conditions: [...ruleToEdit.conditions, newCondition] });
  };

  const removeFilter = (index: number) => {
    if (!ruleToEdit) return;
    const updatedFilters = ruleToEdit.filters.filter((_, i) => i !== index);
    setRuleToEdit({ ...ruleToEdit, filters: updatedFilters });
  };

  const removeCondition = (index: number) => {
    if (!ruleToEdit) return;
    const updatedConditions = ruleToEdit.conditions.filter((_, i) => i !== index);
    setRuleToEdit({ ...ruleToEdit, conditions: updatedConditions });
  };

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
      <br />
      <br />
      <CreateTemplateRule />
      {rules.length === 0 ? (
        <Typography variant="body1">No rules available.</Typography>
      ) : (
        <div style={{ display: 'flex' }}>
          <TableContainer component={Paper} style={{ flex: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow 
                    key={rule.id} 
                    hover 
                    onClick={() => setSelectedRule(rule)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell>{rule.rule_type}</TableCell>
                    <TableCell>{rule.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(rule);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(rule);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Drawer
            anchor="right"
            variant="persistent"
            open={!!selectedRule}
            PaperProps={{
              style: {
                top: '64px', // Adjust this value to match the height of your header
                height: 'calc(100% - 64px)', // Adjust height to exclude the header
                width: drawerCollapsed ? '50px' : '400px', // Collapsed width
                overflow: 'hidden',
              },
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {!drawerCollapsed && (
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px' 
                  }}
                >
                  <Typography 
                    variant="h6" 
                    noWrap 
                    style={{ textAlign: 'left' }}
                  >
                    {selectedRule ? selectedRule.name : 'Details'}
                  </Typography>
                </div>
              )}
              {drawerCollapsed && (
                <div 
                  style={{ 
                    writingMode: 'vertical-rl', 
                    textAlign: 'center', 
                    transform: 'rotate(180deg)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    flex: 1 
                  }}
                >
                  <Typography variant="h6" noWrap>
                    {selectedRule ? selectedRule.name : 'Details'}
                  </Typography>
                </div>
              )}
              {!drawerCollapsed && selectedRule && (
                <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
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
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  padding: '8px', 
                  borderTop: '1px solid #ccc', 
                  marginTop: 'auto' 
                }}
              >
                <IconButton onClick={toggleDrawer}>
                  {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
              </div>
            </div>
          </Drawer>
        </div>
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the rule "{ruleToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
      >
        <DialogTitle>Edit Rule</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Modify the details of the rule below.
          </DialogContentText>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={ruleToEdit?.name || ''}
            onChange={(e) => setRuleToEdit({ ...ruleToEdit!, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={ruleToEdit?.description || ''}
            onChange={(e) => setRuleToEdit({ ...ruleToEdit!, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Type"
            fullWidth
            value={ruleToEdit?.rule_type || ''}
            onChange={(e) => setRuleToEdit({ ...ruleToEdit!, rule_type: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Aggregator"
            fullWidth
            value={ruleToEdit?.aggregator || ''}
            onChange={(e) => setRuleToEdit({ ...ruleToEdit!, aggregator: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Error Message"
            fullWidth
            value={ruleToEdit?.error_message || ''}
            onChange={(e) => setRuleToEdit({ ...ruleToEdit!, error_message: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={ruleToEdit?.is_active || false}
                onChange={(e) => setRuleToEdit({ ...ruleToEdit!, is_active: e.target.checked })}
              />
            }
            label="Active"
          />
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          {ruleToEdit?.filters.map((filter, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <TextField
                label="Field"
                value={filter.field}
                onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
              />
              <TextField
                label="Operator"
                value={filter.operator}
                onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
              />
              <TextField
                label="Value"
                value={filter.value}
                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
              />
              <Button color="secondary" onClick={() => removeFilter(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addFilter} color="primary">
            Add Filter
          </Button>
          <Typography variant="h6" gutterBottom>
            Conditions
          </Typography>
          {ruleToEdit?.conditions.map((condition, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <TextField
                label="Field"
                value={condition.field}
                onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
              />
              <TextField
                label="Operator"
                value={condition.operator}
                onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
              />
              <TextField
                label="Value"
                value={condition.value}
                onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
              />
              <TextField
                label="Order"
                type="number"
                value={condition.order}
                onChange={(e) => handleConditionChange(index, 'order', e.target.value)}
              />
              <Button color="secondary" onClick={() => removeCondition(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addCondition} color="primary">
            Add Condition
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleEditSave} color="secondary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Rules;
