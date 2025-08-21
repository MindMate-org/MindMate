import { db } from '../../../hooks/use-initialize-database';

export const addressBookDbInit = async () => {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    -- contact
    CREATE TABLE IF NOT EXISTS contact (
      id INTEGER PRIMARY KEY,
      name TEXT,
      phone_number TEXT,
      profile_image TEXT,
      memo TEXT,
      is_me INTEGER
    );

    -- tag
    CREATE TABLE IF NOT EXISTS tag (
      id INTEGER PRIMARY KEY,
      name TEXT,
      color TEXT
    );

    -- contact_tag (다대다 연결 테이블)
    CREATE TABLE IF NOT EXISTS contact_tag (
      id INTEGER PRIMARY KEY,
      contact_id INTEGER,
      tag_id INTEGER,
      FOREIGN KEY (contact_id) REFERENCES contact(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE
    );

    -- note_group (contact별 메모 그룹)
    CREATE TABLE IF NOT EXISTS note_group (
      group_id INTEGER PRIMARY KEY,
      contact_id INTEGER,
      title TEXT,
      FOREIGN KEY (contact_id) REFERENCES contact(id) ON DELETE CASCADE
    );

    -- note_item (메모 그룹 내부 아이템)
    CREATE TABLE IF NOT EXISTS note_item (
      item_id INTEGER PRIMARY KEY,
      group_id INTEGER,
      title TEXT,
      content TEXT,
      FOREIGN KEY (group_id) REFERENCES note_group(group_id) ON DELETE CASCADE
    );
  `);

  // Add missing columns to existing tables
  await addMissingColumns();

  // Mock data insertion removed for production
  // console.log('✅ SQLite DB initialized (expo-sqlite/next)');
};

const addMissingColumns = async () => {
  try {
    // Check if created_at column exists and add if missing
    try {
      await db.execAsync('ALTER TABLE contact ADD COLUMN created_at TEXT');
    } catch (error) {
      // Column already exists, ignore error
    }

    // Check if updated_at column exists and add if missing
    try {
      await db.execAsync('ALTER TABLE contact ADD COLUMN updated_at TEXT');
    } catch (error) {
      // Column already exists, ignore error
    }

    // Check if deleted_at column exists and add if missing
    try {
      await db.execAsync('ALTER TABLE contact ADD COLUMN deleted_at TEXT');
    } catch (error) {
      // Column already exists, ignore error
    }
  } catch (error) {}
};

// Mock data insertion function removed for production use
