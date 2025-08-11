CREATE TABLE "user" (
  id        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phone     VARCHAR(15) NOT NULL,
  username  VARCHAR(50) NOT NULL,
  sessionId VARCHAR(100) DEFAULT NULL,
  active    BOOLEAN DEAFULT TRUE
);
CREATE INDEX "user_phone" ON "user"("phone");

CREATE TABLE "notification" (
  id        BIGINT NOT NULL,
  userId    INT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW,
  type      VARCHAR(20) NOT NULL,
  data      JSON DEFAULT NULL,
  consumed  BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("userId") REFERENCES "user"("id")
);

CREATE TABLE "smsMessage" (
  id          BIGINT NOT NULL,
  targetPhone VARCHAR(15) NOT NULL,
  body        TEXT NOT NULL,
  serviceId   VARCHAR(200) NOT NULL,
  tags        VARCHAR(50)[] DEFAULT [],
  costId      BIGINT NOT NULL
); 

CREATE TABLE "cost" (
  id        BIGINT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW,
  value     FLOAT NOT NULL,
  type      VARCHAR(20) NOT NULL,
  data      JSON DEFAULT NULL
);

CREATE TABLE "post" (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  authorId  INT NOT NULL REFERENCES "user"("id"),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW,
  
);

CREATE TABLE "postRating" (
  id          BIGINT NOT NULL,
  timestamp   TIMESTAMP NOT NULL DEFAULT NOW,
  userId      INT NOT NULL REFERENCES "user"("id"),
  postId      BIGINT NOT NULL REFERENCES "post"("id"),
  isPositive  BOOLEAN NOT NULL
);

