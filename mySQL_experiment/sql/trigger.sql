CREATE TRIGGER check_transaction_budget
BEFORE INSERT ON Transactions
FOR EACH ROW
BEGIN
    DECLARE total_budget DECIMAL(15,2);

    SELECT SUM(Amount) INTO total_budget
    FROM Transactions;

    SET total_budget = total_budget + NEW.Amount;

    IF total_budget > 6000 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction exceeds the total budget limit of 6000';
    END IF;
END;
