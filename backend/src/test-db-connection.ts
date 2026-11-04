
import "dotenv/config";
import mariadb from "mariadb";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

const url = new URL(databaseUrl);

async function testConnection() {
  let connection;

  try {
    connection = await mariadb.createConnection({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    connectTimeout: 10000,
    allowPublicKeyRetrieval: true,
    });

    const result = await connection.query("SELECT 1 AS result");

    console.log("Direct MySQL connection successful!");
    console.log("Query result:", result);
  } catch (error) {
    console.error("Direct MySQL connection failed:");

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Code:", (error as any).code);
      console.error("Errno:", (error as any).errno);
      console.error("SQL State:", (error as any).sqlState);
    } else {
      console.error(error);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
