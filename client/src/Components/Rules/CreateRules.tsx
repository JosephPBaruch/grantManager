import { Container, Typography, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';

const CreateRules = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/rules');
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
          <Typography>
            Details about Rule 1.
          </Typography>
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
