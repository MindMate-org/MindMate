import { NoteGroup, NoteItem } from '../types/address-book-type';

import { db } from '@/src/hooks/use-initialize-database';

// 특정 연락처의 모든 메모 그룹 조회
export const getNoteGroupsByContactId = async (contactId: string): Promise<NoteGroup[]> => {
  try {
    const result = await db.getAllAsync<NoteGroup>(
      'SELECT * FROM note_group WHERE contact_id = ? ORDER BY group_id',
      [contactId],
    );

    return result;
  } catch (error) {
    console.error('❌ 메모 그룹 조회 실패:', error);
    throw error;
  }
};

// 특정 그룹의 모든 노트 아이템 조회
export const getNoteItemsByGroupId = async (groupId: string): Promise<NoteItem[]> => {
  try {
    const result = await db.getAllAsync<NoteItem>(
      'SELECT * FROM note_item WHERE group_id = ? ORDER BY item_id',
      [groupId],
    );

    return result;
  } catch (error) {
    console.error('❌ 노트 아이템 조회 실패:', error);
    throw error;
  }
};

// 특정 노트 아이템 하나 조회
export const getNoteItemById = async (itemId: string): Promise<NoteItem | null> => {
  try {
    const result = await db.getFirstAsync<NoteItem>('SELECT * FROM note_item WHERE item_id = ?', [
      itemId,
    ]);

    return result || null;
  } catch (error) {
    console.error('❌ 노트 아이템 조회 실패:', error);
    throw error;
  }
};
