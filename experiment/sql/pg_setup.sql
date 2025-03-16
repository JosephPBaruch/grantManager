
DROP TABLE IF EXISTS test."Transactions";
DROP TABLE IF EXISTS test."Grants";
DROP TABLE IF EXISTS test."Users";


CREATE TABLE IF NOT EXISTS test."Users"
(
    "UserID" integer NOT NULL DEFAULT nextval('"Users_UserID_seq"'::regclass),
    "FirstName" text COLLATE pg_catalog."default" NOT NULL,
    "LastName" text COLLATE pg_catalog."default",
    "Email" text COLLATE pg_catalog."default",
    "Hash" text COLLATE pg_catalog."default",
    CONSTRAINT "Users_pkey" PRIMARY KEY ("UserID")
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS test."Users"
    OWNER to postgres;


INSERT INTO test."Users"("UserID", "FirstName", "LastName", "Email", "Hash")
VALUES
    (1,'John', 'Doe', 'JohnDoe@gmail.com', 'asdfasdfasdfasdf'),
    (2,'Jane','Smith','jane.smith@example.com','hashedpassword2'),
    (3,'Alice','Johnson','alice.johnson@example.com','hashedpassword3');

--------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS test."Grants"
(
    "GrantID" integer NOT NULL DEFAULT nextval('"Grants_GrantID_seq"'::regclass),
    "GrantName" text COLLATE pg_catalog."default" NOT NULL,
    "Amount" money NOT NULL,
    CONSTRAINT "Grants_pkey" PRIMARY KEY ("GrantID")
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS test."Grants"
    OWNER to postgres;

INSERT INTO test."Grants"("GrantID", "GrantName", "Amount")
VALUES
    (1,'Research Grant A',100000.00),
    (2,'Community Grant B',50000.00),
    (3,'Education Grant C',75000.00);

--------------------------------------------------------------------------------


CREATE TABLE IF NOT EXISTS test."Transactions"
(
    "TransactionID" integer NOT NULL DEFAULT nextval('"Transactions_TransactionID_seq"'::regclass),
    "GrantID" integer NOT NULL,
    "UserID" integer NOT NULL,
    "Amount" money NOT NULL,
    "Date" date NOT NULL,
    "Description" text,
    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("TransactionID"),
    CONSTRAINT fk_grant_id FOREIGN KEY ("GrantID")
        REFERENCES test."Grants" ("GrantID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_user_id FOREIGN KEY ("UserID")
        REFERENCES test."Users" ("UserID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS test."Transactions"
    OWNER to postgres;


INSERT INTO test."Transactions" ("GrantID", "UserID", "Amount", "Date", "Description")
VALUES
    (1,1,1000.00,'2023-01-15','Purchase of lab equipment'),
    (2,2,1000.00,'2023-02-20','Community event expenses'),
    (3,3,1000.00,'2023-03-10','Educational materials'),
    (1,1,1000.00,'2023-04-05','Research materials'),
    (2,2,1000.00,'2023-05-12','Community outreach program');
