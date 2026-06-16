CREATE TABLE IF NOT EXISTS niches (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO niches (id, name) VALUES
  ('n1','Lifestyle & Wellness'),('n2','Beauty'),('n3','Skincare'),
  ('n4','Fashion'),('n5','Food & Lifestyle'),('n6','Tech'),
  ('n7','Gaming'),('n8','Fitness'),('n9','Travel'),('n10','Parenting'),
  ('n11','Finance'),('n12','Education'),('n13','Entertainment'),
  ('n14','Automotive'),('n15','Sports'),('n16','Home & Decor'),
  ('n17','Pet'),('n18','Music'),('n19','Comedy');
