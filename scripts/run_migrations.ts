import fs                   from "node:fs/promises";
import path                 from "node:path";
import {Client}             from "pg";
import {inspect, parseArgs} from "node:util";

export async function runMigrations(
  runSql: (sql: string) => Promise<void>,
  {count=0, forward=true, log}:{
    count?: number,
    forward?: boolean,
    log?: (data: any) => void
  }={},
)
{
  let lastMigration:string | null;
  try {
    lastMigration = (
      (await fs.readFile("./last_migration.txt"))
      .toString("utf8")
    );
  } catch (e: any) {
    log?.(`No previous migrations detected: ${e}\n`);
    lastMigration = null;
  }

  const fwdMigrationFiles  = await getMigrationFilenamesInDir("./migrations/");

  const migrationsWorkingDirPath  = (
    forward
    ? "./migrations/"
    : "./migrations/reverse/"
  );
  let remainingMigrationFiles:string[];
  if (forward) {
    const startIndex = fwdMigrationFiles.indexOf(lastMigration ?? "") + 1;
    remainingMigrationFiles = fwdMigrationFiles.slice(
      startIndex,
      count ? startIndex + count : undefined
    );
  } else if (!lastMigration) {
    remainingMigrationFiles = [];
  } else {
    const endIndex          = fwdMigrationFiles.indexOf(lastMigration) + 1;
    remainingMigrationFiles = fwdMigrationFiles.slice(
      Math.max(0, endIndex - (count || Infinity)),
      endIndex
    ).reverse();
  }

  if (remainingMigrationFiles.length === 0) {
    log?.("Migrations up to date!\n");
    return;
  }

  log?.("Running migrations...\n");
  for (let migrationFile of remainingMigrationFiles) {
    const migrationFilePath = path.join(
      migrationsWorkingDirPath,
      migrationFile
    );
    log?.(`${migrationFilePath}...`);
    const sql = (
      (await fs.readFile(migrationFilePath))
      .toString()
    );
    await runSql(sql);

    await fs.writeFile("./last_migration.txt", (
      forward
      ? migrationFile
      : fwdMigrationFiles[fwdMigrationFiles.indexOf(migrationFile) - 1]
    ));
    log?.(" Done!\n");
  }

  log?.(`Ran ${remainingMigrationFiles.length} migrations successfully\n`);
}

async function getMigrationFilenamesInDir(dirPath: string)
{
  const dir       = await fs.opendir(dirPath);
  const fileNames = [] as string[];
  for (
    let filePath = await dir.read();
    filePath;
    filePath = await dir.read()
  ) {
    if (filePath.isFile() && filePath.name.endsWith(".sql")) {
      fileNames.push(filePath.name);
    }
  }
  fileNames.sort();
  return fileNames;
}

const {count, dbHost, dbPass, dbUser, reverse} = parseArgs({
  options: {
    count: {
      short: "c",
      type: "string",
      default: "0",
    },
    dbHost: {
      short: "h",
      type: "string",
      default: "localhost",
    },
    dbUser: {
      short: "u",
      type: "string",
      default: "postgres",
    },
    dbPass: {
      short: "p",
      type: "string",
      default: "postgres",
    },
    reverse: {
      short: "r",
      type: "boolean",
      default: false,
    },
  },
}).values;
const pg = new Client({
  host: dbHost,
  user: dbUser,
  password: dbPass,
});
pg.connect().then(async () =>
{
  await runMigrations(async sql => {await pg.query(sql)}, {
    count: Number(count),
    forward: !reverse,
    log: (data) => process.stdout.write(
      typeof data === "string"
      ? data
      : inspect(data, {colors: true, depth: 5})
    )
  });

  pg.end();
});

