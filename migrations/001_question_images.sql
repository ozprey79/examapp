ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_alt TEXT;

COMMENT ON COLUMN questions.image_url IS
  'Hosted image URL or constrained data URL imported with the question bundle.';

COMMENT ON COLUMN questions.image_alt IS
  'Required alternative text for an image-bearing question.';
