import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CircularProgress, LinearProgress, Box } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { useBackendHost } from '../host';

const Home: React.FC = () => {
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
    <Container maxWidth="md">
        <br />
      {loading ? (
        <CircularProgress />
      ) : grantData ? (
        <Card>
          <CardContent>
          <Typography variant="h3">Grant Fund Projection</Typography>
          <Box mt={2}>
          <Typography variant="h4">Current: ${grantData.grant_projected_remaining_funds} / ${grantData.grant_total_funds}</Typography>
              <LinearProgress
                variant="determinate"
                value={(grantData.grant_projected_remaining_funds / grantData.grant_total_funds) * 100}
              />
            </Box>
            <br />
            <Typography variant="h6">Total Expense Amount: ${grantData.existing_expense_amount + grantData.projected_expense_amount}</Typography>
            <Typography variant="h6">Approved Expense Amount: ${grantData.projected_expense_amount}</Typography>
            <Typography variant="h6">Pending Expense Amount: ${grantData.existing_expense_amount}</Typography>
          </CardContent>
        </Card>
      ) : (
        <Typography color="error">Failed to load grant data</Typography>
      )}
    </Container>
  );
};

export default Home;