-- Insert into Pets
INSERT INTO Pets (Name, Age, StreetNumber, City, ZipCode, State, TypeofPet) VALUES
('Buddy', 3, '12', 'New York', '10001', 'NY', 'Dog'),
('Mittens', 2, '456', 'Los Angeles', '90001', 'CA', 'Cat'),
('Charlie', 5, '789', 'Chicago', '60601', 'IL', 'Dog');

-- Insert into Owners
INSERT INTO Owners (LastName, StreetNumber, City, ZipCode, State, Age, AnnualIncome) VALUES
('Smith', '12', 'New York', '10001', 'NY', 16, 0),
('Johnson', '34', 'Los Angeles', '90001', 'CA', 42, 75000),
('Brown', '56', 'Moscow', '10001', 'Idaho', 17, 0);

-- Insert into Owns
INSERT INTO Owns (PetID, OID, Year, PetAgeatOwnership, PricePaid) VALUES
(1, 1, 2021, 1, 500.00),
(2, 2, 2022, 1, 300.00),
(3, 3, 2020, 3, 700.00);

-- Insert into Foods
INSERT INTO Foods (Name, Brand, TypeofFood, Price, ItemWeight, ClassofFood) VALUES
('Kibble Plus', 'Purina', 'Dry', 15.99, 5.0, 'Premium'),
('Whiskas Delight', 'Whiskas', 'Wet', 12.50, 2.5, 'Standard'),
('Whiskas Delight', 'Whiskas', 'Wet', 12.51, 2.5, 'Standard'),
('Organic Treats', 'Nature’s Best', 'Dry', 20.00, 3.0, 'Organic'), 
('Organic Treats', 'Nature’s Best', 'Dry', 26.00, 3.0, 'Organic');

-- Insert into Likes
INSERT INTO Likes (PetID, TypeofFood) VALUES
(1, 'Soggy'),
(2, 'Wet'),
(3, 'Dry');

-- Insert into Purchases
INSERT INTO Purchases (OID, FoodID, PetID, Month, Year, Quantity) VALUES
(1, 1, 1, 'January', 2024, 2),
(2, 2, 2, 'February', 2024, 1),
(3, 3, 3, 'March', 2024, 3);
