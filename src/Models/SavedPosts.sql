CREATE TABLE savedpost(
    owner VARCHAR(50) NOT NULL REFERENCES users(username),
    post BIGINT REFERENCES posts(id),
    id BIGSERIAL NOT NULL PRIMARY KEY
); 