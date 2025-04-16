import { Container, Button, Dialog, DialogTitle, DialogContent, TextField, Box } from '@mui/material';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

const CreateTemplateRule = () => {
  const [open, setOpen] = useState(false);
  const [grantId, setGrantId] = useState(localStorage.getItem("selected_grant_id"));
  const [templateName, setTemplateName] = useState('');
  const [kwargs, setKwargs] = useState('{}');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const url = `http://localhost:8000/api/v1/rules/grant/${grantId}/template/${templateName}?kwargs=${encodeURIComponent(kwargs)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': 'Bearer YOUR_TOKEN_HERE', // Replace with actual token
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
              <TextField
                label="Template Name"
                variant="outlined"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                fullWidth
              />
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
