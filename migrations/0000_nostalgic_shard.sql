CREATE TYPE provider AS ENUM ('google');

CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    pwd TEXT,
    provider provider NOT NULL,
    p_id UUID NOT NULL,
    email TEXT NOT NULL,
    pfp TEXT
);