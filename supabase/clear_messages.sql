-- SQL Script to clear all messages for fresh testing
-- WARNING: This will delete all existing communication history.

-- 1. Clear the messages table
DELETE FROM messages;

-- 2. Optional: If you want to reset the sequence (if using serial IDs, but we use UUIDs)
-- ALTER SEQUENCE messages_id_seq RESTART WITH 1;

-- 3. Notify that the operation is complete
SELECT 'Communication history cleared successfully' as result;
