CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100) UNIQUE,
    PasswordHash VARCHAR(255)
);

CREATE TABLE Grants (
    GrantID INT PRIMARY KEY AUTO_INCREMENT,
    GrantName VARCHAR(100),
    TotalBudget DECIMAL(15,2),
    RemainingBudget DECIMAL(15,2)
);

CREATE TABLE Transactions (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    GrantID INT,
    UserID INT,
    Amount DECIMAL(15,2),
    TransactionDate DATE,
    Description TEXT,
    FOREIGN KEY (GrantID) REFERENCES Grants(GrantID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);