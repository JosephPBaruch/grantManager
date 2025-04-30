import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import 'react-toastify/dist/ReactToastify.css';
import { useBackendHost } from '../host';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  textField: {
    width: '100%',
  },
  button: {
    width: '100%',
  },
});

const Home: React.FC = () => {
    const classes = useStyles();
    const backendHost = useBackendHost();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [grantData, setGrantData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const accessToken = localStorage.getItem('access_token');

  useEffect(() => {
    if (!accessToken) {
      console.error('No access token found');
      return;
    }

    const fetchGrantData = async () => {
      try {
        const response = await fetch(
          `http://${backendHost}:8000/api/v1/grant-projection/${localStorage.getItem("selected_grant_id")}`,
          {
            method: 'GET',
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch grant data');
        }

        const data = await response.json();
        setGrantData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrantData();
  }, [accessToken, backendHost]);

  if (!accessToken) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Typography style={{ paddingTop: '20px' }} variant="h4" component="h1" gutterBottom>
        Home
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : grantData ? (
        <Card>
          <CardContent>
            <Typography variant="h6">Grant ID:</Typography>
            <Typography>{grantData.grant_id}</Typography>
            <Typography variant="h6">Existing Expense Amount:</Typography>
            <Typography>${grantData.existing_expense_amount}</Typography>
            <Typography variant="h6">Projected Expense Amount:</Typography>
            <Typography>${grantData.projected_expense_amount}</Typography>
            <Typography variant="h6">Grant Total Funds:</Typography>
            <Typography>${grantData.grant_total_funds}</Typography>
            <Typography variant="h6">Grant Projected Remaining Funds:</Typography>
            <Typography>${grantData.grant_projected_remaining_funds}</Typography>
            <Typography variant="h6">Grant Current Remaining Funds:</Typography>
            <Typography>${grantData.grant_current_remaining_funds}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography color="error">Failed to load grant data</Typography>
      )}
    </Container>
  );
};

export default Home;