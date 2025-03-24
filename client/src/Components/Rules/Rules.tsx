import { useEffect, useState } from 'react';
import { Rule } from '../../types/rules';

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

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
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Rules</h1>
      {rules.length === 0 ? (
        <div>No rules available.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Table</th>
              <th>Enabled</th>
              <th>RuleID</th>
              <th>Trigger</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(rule => (
              <tr key={rule.RuleID}>
                <td>{rule.Name}</td>
                <td>{rule.Description}</td>
                <td>{rule.Table}</td>
                <td>{rule.Enabled ? 'Yes' : 'No'}</td>
                <td>{rule.RuleID}</td>
                <td>{rule.Trigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Rules;
