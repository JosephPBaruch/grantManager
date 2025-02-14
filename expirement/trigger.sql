DELIMITER //

CREATE TRIGGER check_transaction_budget
BEFORE INSERT ON Transactions
FOR EACH ROW
BEGIN
    DECLARE total_budget DECIMAL(15,2);

    -- Calculate the total budget for the grant
    SELECT SUM(Amount) INTO total_budget
    FROM Transactions
    WHERE GrantID = NEW.GrantID;

    -- Add the new transaction amount to the total budget
    SET total_budget = total_budget + NEW.Amount;

    -- Check if the total budget exceeds 15000
    IF total_budget > 15000 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction exceeds the total budget limit of 15000';
    END IF;
END;

//
DELIMITER ;
