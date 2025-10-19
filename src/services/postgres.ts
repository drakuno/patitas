import {Client} from "pg";

console.log(process.env);
export const pgdb = new Client({
  host: process.env.PGHOST ?? "postgres",
  port: +(process.env.PGPORT ?? "5432"),
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres",
  database: process.env.PGDATABASE ?? "patitas",
});

export const whenReady = pgdb.connect().then(() => pgdb);

