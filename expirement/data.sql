-- Insert into Users
INSERT INTO Users (FirstName, LastName, Email, PasswordHash) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashedpassword1'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashedpassword2'),
('Alice', 'Johnson', 'alice.johnson@example.com', 'hashedpassword3');

-- Insert into Grants
INSERT INTO Grants (GrantName, TotalBudget, RemainingBudget) VALUES
('Research Grant A', 100000.00, 80000.00),
('Community Grant B', 50000.00, 45000.00),
('Education Grant C', 75000.00, 60000.00);

-- Insert into Transactions
INSERT INTO Transactions (GrantID, UserID, Amount, TransactionDate, Description) VALUES
(1, 1, 5000.00, '2023-01-15', 'Purchase of lab equipment'),
(2, 2, 3000.00, '2023-02-20', 'Community event expenses'),
(3, 3, 1500.00, '2023-03-10', 'Educational materials'),
(1, 1, 2000.00, '2023-04-05', 'Research materials'),
(2, 2, 1000.00, '2023-05-12', 'Community outreach program');
