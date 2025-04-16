import { Container, Button, Dialog, DialogTitle, DialogContent, TextField, Box, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';

const CreateTemplateRule = () => {
  const [open, setOpen] = useState(false);
  const [grantId, setGrantId] = useState(localStorage.getItem("selected_grant_id"));
  const [templateName, setTemplateName] = useState('');
  const [kwargs, setKwargs] = useState('{}');
  const [templateOptions, setTemplateOptions] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/rules/templates/', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("access_token")}`, 
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTemplateOptions(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const url = `http://localhost:8000/api/v1/rules/grant/${grantId}/template/${templateName}?kwargs=${encodeURIComponent(kwargs)}/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("access_token")}`, 
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response:', data);
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create Template Rule
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Create Rule</DialogTitle>
        <DialogContent>
          <Container>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Grant ID"
                variant="outlined"
                value={grantId}
                onChange={(e) => setGrantId(e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="template-select-label">Template Name</InputLabel>
                <Select
                  labelId="template-select-label"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                >
                  {templateOptions.map((template) => (
                    <MenuItem key={template} value={template}>
                      {template}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Kwargs (JSON)"
                variant="outlined"
                value={kwargs}
                onChange={(e) => setKwargs(e.target.value)}
                fullWidth
              />
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Box>
          </Container>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateTemplateRule;
