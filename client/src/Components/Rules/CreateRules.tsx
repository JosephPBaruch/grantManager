import { useState } from 'react';
import { Button, Container, TextField, Typography, Box, Select, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { useBackendHost } from '../../host';

type Filter = {
  field: string;
  operator: string;
  value: string;
};

type Condition = {
  field: string;
  operator: string;
  value: string;
  order: number;
};

type FormData = {
  grant_id: string;
  name: string;
  description: string;
  rule_type: string;
  aggregator: string;
  error_message: string;
  is_active: boolean;
  filters: Filter[];
  conditions: Condition[];
};

const CreateRules = () => {
  const [formData, setFormData] = useState<FormData>({
    grant_id: localStorage.getItem('selected_grant_id') || '',
    name: '',
    description: '',
    rule_type: '',
    aggregator: '',
    error_message: '',
    is_active: true,
    filters: [{ field: '', operator: '=', value: '' }],
    conditions: [{ field: '', operator: '=', value: '', order: 0 }],
  });
  const backendHost = useBackendHost();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = <T extends keyof FormData>(
    index: number,
    arrayName: T,
    field: keyof FormData[T][number],
    value: string | number
  ) => {
    setFormData({
      ...formData,
      [arrayName]: formData[arrayName].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ) as FormData[T],
    });
  };

  const addArrayItem = <T extends keyof FormData>(arrayName: T, newItem: FormData[T][number]) => {
    setFormData({
      ...formData,
      [arrayName]: [...formData[arrayName], newItem] as FormData[T],
    });
  };

  const removeArrayItem = <T extends keyof FormData>(arrayName: T, index: number) => {
    setFormData({
      ...formData,
      [arrayName]: formData[arrayName].filter((_, i) => i !== index) as FormData[T],
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://${backendHost}:8000/api/v1/rules/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Rule created successfully!');
      } else {
        toast.error('Failed to create rule.');
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('An error occurred.');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Create Rule
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Grant ID"
          name="grant_id"
          value={formData.grant_id}
          onChange={handleChange}
          placeholder="Enter the grant ID (e.g., UUID)"
          fullWidth
        />
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter the rule name"
          fullWidth
        />
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a brief description of the rule"
          fullWidth
        />
        <TextField
          label="Rule Type"
          name="rule_type"
          value={formData.rule_type}
          onChange={handleChange}
          placeholder="Enter the rule type (e.g., expense)"
          fullWidth
        />
        <Box>
          <Typography>Aggregator</Typography>
          <Select
            name="aggregator"
            value={formData.aggregator}
            onChange={(e) =>
              setFormData({
                ...formData,
                aggregator: e.target.value,
              })
            }
            fullWidth
          >
            <MenuItem value="MAX">MAX</MenuItem>
            <MenuItem value="SUM">SUM</MenuItem>
          </Select>
        </Box>
        <TextField
          label="Error Message"
          name="error_message"
          value={formData.error_message}
          onChange={handleChange}
          placeholder="Enter the error message to display"
          fullWidth
        />
        <Typography variant="h6">Filters</Typography>
        {formData.filters.map((filter, index) => (
          <Box key={index} display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Filter Field"
              value={filter.field}
              onChange={(e) => handleArrayChange(index, 'filters', 'field', e.target.value)}
              placeholder="Enter the filter field (e.g., amount)"
              fullWidth
            />
            <Select
              value={filter.operator}
              onChange={(e) => handleArrayChange(index, 'filters', 'operator', e.target.value)}
              fullWidth
            >
              <MenuItem value="=">=</MenuItem>
              <MenuItem value="!=">!=</MenuItem>
              <MenuItem value=">">&gt;</MenuItem>
              <MenuItem value="<">&lt;</MenuItem>
              <MenuItem value=">=">&gt;=</MenuItem>
              <MenuItem value="<=">&lt;=</MenuItem>
            </Select>
            <TextField
              label="Filter Value"
              value={filter.value}
              onChange={(e) => handleArrayChange(index, 'filters', 'value', e.target.value)}
              placeholder="Enter the filter value (e.g., 1000)"
              fullWidth
            />
            <Button variant="outlined" color="secondary" onClick={() => removeArrayItem('filters', index)}>
              Remove Filter
            </Button>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={() => addArrayItem('filters', { field: '', operator: '=', value: '' })}
        >
          Add Filter
        </Button>

        <Typography variant="h6">Conditions</Typography>
        {formData.conditions.map((condition, index) => (
          <Box key={index} display="flex" flexDirection="column" gap={1}>
            <TextField
              label="Condition Field"
              value={condition.field}
              onChange={(e) => handleArrayChange(index, 'conditions', 'field', e.target.value)}
              placeholder="Enter the condition field (e.g., category)"
              fullWidth
            />
            <Select
              value={condition.operator}
              onChange={(e) => handleArrayChange(index, 'conditions', 'operator', e.target.value)}
              fullWidth
            >
              <MenuItem value="=">=</MenuItem>
              <MenuItem value="!=">!=</MenuItem>
              <MenuItem value=">">&gt;</MenuItem>
              <MenuItem value="<">&lt;</MenuItem>
              <MenuItem value=">=">&gt;=</MenuItem>
              <MenuItem value="<=">&lt;=</MenuItem>
            </Select>
            <TextField
              label="Condition Value"
              value={condition.value}
              onChange={(e) => handleArrayChange(index, 'conditions', 'value', e.target.value)}
              placeholder="Enter the condition value (e.g., travel)"
              fullWidth
            />
            <TextField
              label="Condition Order"
              type="number"
              value={condition.order}
              onChange={(e) => handleArrayChange(index, 'conditions', 'order', parseInt(e.target.value, 10))}
              placeholder="Enter the condition order (e.g., 0, 1, 2)"
              fullWidth
            />
            <Button variant="outlined" color="secondary" onClick={() => removeArrayItem('conditions', index)}>
              Remove Condition
            </Button>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={() => addArrayItem('conditions', { field: '', operator: '=', value: '', order: 0 })}
        >
          Add Condition
        </Button>

        <Button variant="contained" color="secondary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRules;
