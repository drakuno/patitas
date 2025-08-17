import {Client} from "pg";

console.log(Deno.env);
console.log({
  host: Deno.env.get("PGHOST"),
  port: Deno.env.get("PGPORT"),
  user: Deno.env.get("PGUSER"),
  password: Deno.env.get("PGPASSWORD"),
});

export const pgdb = new Client({
  host: Deno.env.get("PGHOST") ?? "postgres",
  port: Deno.env.get("PGPORT") ?? "5432",
  user: Deno.env.get("PGUSER") ?? "postgres",
  password: Deno.env.get("PGPASSWORD") ?? "postgres",
  database: Deno.env.get("PGDATABASE") ?? "patitas",
});

export const whenReady = pgdb.connect().then(() => pgdb);

