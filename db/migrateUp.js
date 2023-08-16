const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./db/mygovernance.db",
  sqlite3.OPEN_READWRITE,
  (err) => {
    if (err) {
      return console.log(err.message);
    }
  }
);

const sql =
  "CREATE TABLE IF NOT EXISTS `proposal` (`id` INTEGER PRIMARY KEY, `proposal_id`, `title`, `overview`, `ipfs_address`)";

db.run(sql);
