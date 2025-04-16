import { useState } from 'react';
import { Button, Container, TextField, Typography, Box, Select, MenuItem } from '@mui/material';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const CreateRules = () => {
  const [formData, setFormData] = useState({
    grant_id: localStorage.getItem('selected_grant_id') || '',
    name: '',
    description: '',
    rule_type: '',
    aggregator: '',
    error_message: '',
    is_active: true,
    filters: [{ field: '', operator: '', value: '' }],
    conditions: [{ field: '', operator: '', value: '', order: 0 }],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/v1/rules/', {
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
        <TextField
          label="Filter Field"
          name="filters[0].field"
          value={formData.filters[0].field}
          onChange={(e) =>
            setFormData({
              ...formData,
              filters: [{ ...formData.filters[0], field: e.target.value }],
            })
          }
          placeholder="Enter the filter field (e.g., amount)"
          fullWidth
        />
        <Box>
          <Typography>Filter Operator</Typography>
          <Select
            name="filters[0].operator"
            value={formData.filters[0].operator}
            onChange={(e) =>
              setFormData({
                ...formData,
                filters: [{ ...formData.filters[0], operator: e.target.value }],
              })
            }
            fullWidth
          >
            <MenuItem value="=">=</MenuItem>
            <MenuItem value="!=">!=</MenuItem>
            <MenuItem value=">">&gt;</MenuItem>
            <MenuItem value="<">&lt;</MenuItem>
            <MenuItem value=">=">&gt;=</MenuItem>
            <MenuItem value="<=">&lt;=</MenuItem>
          </Select>
        </Box>
        <TextField
          label="Filter Value"
          name="filters[0].value"
          value={formData.filters[0].value}
          onChange={(e) =>
            setFormData({
              ...formData,
              filters: [{ ...formData.filters[0], value: e.target.value }],
            })
          }
          placeholder="Enter the filter value (e.g., 1000)"
          fullWidth
        />
        <TextField
          label="Condition Field"
          name="conditions[0].field"
          value={formData.conditions[0].field}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: [{ ...formData.conditions[0], field: e.target.value }],
            })
          }
          placeholder="Enter the condition field (e.g., category)"
          fullWidth
        />
        <Box>
          <Typography>Condition Operator</Typography>
          <Select
            name="conditions[0].operator"
            value={formData.conditions[0].operator}
            onChange={(e) =>
              setFormData({
                ...formData,
                conditions: [{ ...formData.conditions[0], operator: e.target.value }],
              })
            }
            fullWidth
          >
            <MenuItem value="=">=</MenuItem>
            <MenuItem value="!=">!=</MenuItem>
            <MenuItem value=">">&gt;</MenuItem>
            <MenuItem value="<">&lt;</MenuItem>
            <MenuItem value=">=">&gt;=</MenuItem>
            <MenuItem value="<=">&lt;=</MenuItem>
          </Select>
        </Box>
        <TextField
          label="Condition Value"
          name="conditions[0].value"
          value={formData.conditions[0].value}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: [{ ...formData.conditions[0], value: e.target.value }],
            })
          }
          placeholder="Enter the condition value (e.g., travel)"
          fullWidth
        />
        <TextField
          label="Condition Order"
          name="conditions[0].order"
          type="number"
          value={formData.conditions[0].order}
          onChange={(e) =>
            setFormData({
              ...formData,
              conditions: [{ ...formData.conditions[0], order: parseInt(e.target.value, 10) }],
            })
          }
          placeholder="Enter the condition order (e.g., 0, 1, 2)"
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default CreateRules;
