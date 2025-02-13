-- Table: Pets
CREATE TABLE Pets (
    PetID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50),
    Age INT,
    StreetNumber VARCHAR(10),
    City VARCHAR(50),
    ZipCode VARCHAR(10),
    State VARCHAR(20),
    TypeofPet VARCHAR(50)
);

-- Table: Owners
CREATE TABLE Owners (
    OID INT PRIMARY KEY AUTO_INCREMENT,
    LastName VARCHAR(50),
    StreetNumber VARCHAR(10),
    City VARCHAR(50),
    ZipCode VARCHAR(10),
    State VARCHAR(20),
    Age INT,
    AnnualIncome DECIMAL(10,2)
);

-- Table: Owns (Many-to-Many Relationship between Pets and Owners)
CREATE TABLE Owns (
    PetID INT,
    OID INT,
    Year INT,
    PetAgeatOwnership INT,
    PricePaid DECIMAL(10,2),
    PRIMARY KEY (PetID, OID),
    FOREIGN KEY (PetID) REFERENCES Pets(PetID) ON DELETE CASCADE,
    FOREIGN KEY (OID) REFERENCES Owners(OID) ON DELETE CASCADE
);

-- Table: Foods
CREATE TABLE Foods (
    FoodID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50),
    Brand VARCHAR(50),
    TypeofFood VARCHAR(50),
    Price DECIMAL(10,2),
    ItemWeight DECIMAL(5,2),
    ClassofFood VARCHAR(50)
);

-- Table: Likes (Many-to-Many Relationship between Pets and Foods)
CREATE TABLE Likes (
    PetID INT,
    TypeofFood VARCHAR(50),
    PRIMARY KEY (PetID, TypeofFood),
    FOREIGN KEY (PetID) REFERENCES Pets(PetID) ON DELETE CASCADE
);

-- Table: Purchases (Relationship between Owners, Foods, and Pets)
CREATE TABLE Purchases (
    OID INT,
    FoodID INT,
    PetID INT,
    Month VARCHAR(20),
    Year INT,
    Quantity INT,
    PRIMARY KEY (OID, FoodID, PetID, Year, Month),
    FOREIGN KEY (OID) REFERENCES Owners(OID) ON DELETE CASCADE,
    FOREIGN KEY (FoodID) REFERENCES Foods(FoodID) ON DELETE CASCADE,
    FOREIGN KEY (PetID) REFERENCES Pets(PetID) ON DELETE CASCADE
);