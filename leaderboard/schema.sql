CREATE TABLE IF NOT EXISTS submissions (
  puzzle_date TEXT NOT NULL,
  edition INTEGER NOT NULL DEFAULT 2,
  device_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 5000),
  PRIMARY KEY (puzzle_date, edition, device_id)
) WITHOUT ROWID;
CREATE INDEX IF NOT EXISTS submissions_date_score ON submissions(puzzle_date, edition, score);
CREATE TABLE IF NOT EXISTS budgets (
  puzzle_date TEXT NOT NULL,
  network TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (puzzle_date, network)
) WITHOUT ROWID;
