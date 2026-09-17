-- Page sections that used to be hardcoded in page screens become block types.
-- Kept in their own migration: a new enum value cannot be used in the same
-- transaction that adds it, and the next migration inserts rows with them.
ALTER TYPE "PageBlockType" ADD VALUE IF NOT EXISTS 'CONTACT_FORM';
ALTER TYPE "PageBlockType" ADD VALUE IF NOT EXISTS 'INTRO_STORY';
