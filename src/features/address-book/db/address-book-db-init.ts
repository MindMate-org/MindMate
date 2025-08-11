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

  await insertAddressBookMockData();
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

    console.log('✅ Missing columns added to contact table');
  } catch (error) {
    console.error('❌ Failed to add missing columns:', error);
  }
};

const insertAddressBookMockData = async () => {
  try {
    await db.execAsync(`
      -- 기존 데이터 삭제 (개발용)
      DELETE FROM contact_tag;
      DELETE FROM note_item;
      DELETE FROM note_group;
      DELETE FROM tag;
      DELETE FROM contact;

      -- 연락처 데이터 삽입
      INSERT INTO contact (name, phone_number, profile_image, memo, is_me, created_at, updated_at, deleted_at) VALUES
        ('김철수', '010-1234-5678', null, '대학교 동기', 0, '2024-01-15T10:30:00Z', '2024-01-15T10:30:00Z', null),
        ('이영희', '010-2345-6789', null, '회사 동료, 마케팅팀', 0, '2024-01-16T14:20:00Z', '2024-01-16T14:20:00Z', null),
        ('박민수', '010-3456-7890', null, '헬스장에서 만난 친구', 0, '2024-01-17T09:15:00Z', '2024-01-17T09:15:00Z', null),
        ('최지은', '010-4567-8901', null, '고등학교 친구, 카페 사장', 0, '2024-01-18T16:45:00Z', '2024-01-18T16:45:00Z', null),
        ('나', '010-9999-0000', null, '내 연락처', 1, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z', null);

      -- 태그 데이터 삽입
      INSERT INTO tag (name, color) VALUES
        ('친구', '#3B82F6'),
        ('가족', '#EF4444'),
        ('직장', '#10B981'),
        ('학교', '#F59E0B'),
        ('취미', '#8B5CF6');

      -- 연락처-태그 연결
      INSERT INTO contact_tag (contact_id, tag_id) VALUES
        (1, 1), (1, 4),  -- 김철수: 친구, 학교
        (2, 1), (2, 3),  -- 이영희: 친구, 직장
        (3, 1), (3, 5),  -- 박민수: 친구, 취미
        (4, 1), (4, 4),  -- 최지은: 친구, 학교
        (5, 2);          -- 나: 가족

      -- 메모 그룹 데이터
      INSERT INTO note_group (contact_id, title) VALUES
        (1, '생일 & 기념일'),
        (1, '좋아하는 것들'),
        (2, '업무 관련'),
        (4, '카페 정보');

      -- 메모 아이템 데이터
      INSERT INTO note_item (group_id, title, content) VALUES
        (1, '생일', '3월 15일'),
        (2, '좋아하는 음식', '치킨, 피자'),
        (2, '취미', '독서, 영화감상'),
        (2, '싫어하는 것', '매운 음식'),
        (3, '담당 업무', '소셜미디어 마케팅'),
        (3, '회의 시간', '매주 화요일 2시'),
        (4, '카페 위치', '강남역 2번 출구'),
        (4, '운영시간', '평일 7시-22시, 주말 9시-23시');
    `);

    console.log('✅ 주소록 목 데이터 삽입 완료');
  } catch (error) {
    console.error('❌ 주소록 목 데이터 삽입 실패:', error);
  }
};
