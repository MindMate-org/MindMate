import { getNoteGroupsByContactId, getNoteItemById } from './get-note-group-data';

import { NoteGroupType, NoteItemType } from '@/src/features/address-book/types/address-book-type';
import { db } from '@/src/hooks/use-initialize-database';

// 노트 그룹 생성
export const createNoteGroup = async (contactId: string, title: string): Promise<NoteGroupType> => {
  try {
    const result = await db.runAsync('INSERT INTO note_group (contact_id, title) VALUES (?, ?)', [
      contactId,
      title,
    ]);

    // 생성된 note_group 반환
    const newNoteGroup = await getNoteGroupsByContactId(result.lastInsertRowId.toString());
    return newNoteGroup[0];
  } catch (error) {
    console.error('노트 그룹 생성 실패:', error);
    throw error;
  }
};

// 노트 그룹 수정
export const updateNoteGroup = async (
  groupId: string,
  noteGroupData: Partial<NoteGroupType>,
): Promise<NoteGroupType> => {
  try {
    // 수정할 필드들만 동적으로 SQL 생성
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (noteGroupData.contact_id !== undefined) {
      updateFields.push('contact_id = ?');
      updateValues.push(noteGroupData.contact_id);
    }
    if (noteGroupData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(noteGroupData.title);
    }

    if (updateFields.length === 0) {
      throw new Error('수정할 데이터가 없습니다.');
    }

    updateValues.push(groupId); // WHERE 조건용 group_id
    const sql = `UPDATE note_group SET ${updateFields.join(', ')} WHERE group_id = ?`;

    await db.runAsync(sql, updateValues);

    // 수정된 note_group 반환
    const updatedNoteGroup = await getNoteGroupsByContactId(groupId);
    return updatedNoteGroup[0];
  } catch (error) {
    console.error('노트 그룹 수정 실패:', error);
    throw error;
  }
};

// 노트 그룹 삭제 (CASCADE로 관련 note_item도 자동 삭제됨)
export const deleteNoteGroup = async (groupId: string): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM note_group WHERE group_id = ?', [groupId]);
    return result.changes > 0; // 삭제된 행이 있으면 true
  } catch (error) {
    console.error('노트 그룹 삭제 실패:', error);
    throw error;
  }
};

// 특정 연락처의 모든 노트 그룹 삭제
export const deleteNoteGroupsByContactId = async (contactId: string): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM note_group WHERE contact_id = ?', [contactId]);
    return result.changes > 0;
  } catch (error) {
    console.error('연락처별 노트 그룹 삭제 실패:', error);
    throw error;
  }
};

// 노트 아이템 생성
export const createNoteItem = async (
  groupId: string,
  title: string,
  content: string,
): Promise<NoteItemType> => {
  try {
    const result = await db.runAsync(
      'INSERT INTO note_item (group_id, title, content) VALUES (?, ?, ?)',
      [groupId, title, content],
    );

    // 생성된 note_item 반환
    const newNoteItem = await getNoteItemById(result.lastInsertRowId.toString());
    if (!newNoteItem) {
      throw new Error('생성된 노트 아이템을 찾을 수 없습니다');
    }
    return newNoteItem;
  } catch (error) {
    console.error('❌ 노트 아이템 생성 실패:', error);
    throw error;
  }
};

// 노트 아이템 수정
export const updateNoteItem = async (
  itemId: string,
  noteItemData: Partial<Pick<NoteItemType, 'group_id' | 'title' | 'content'>>,
): Promise<NoteItemType> => {
  try {
    // 수정할 필드들만 동적으로 SQL 생성
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (noteItemData.group_id !== undefined) {
      updateFields.push('group_id = ?');
      updateValues.push(noteItemData.group_id);
    }
    if (noteItemData.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(noteItemData.title);
    }
    if (noteItemData.content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(noteItemData.content);
    }

    if (updateFields.length === 0) {
      throw new Error('수정할 데이터가 없습니다.');
    }

    updateValues.push(itemId); // WHERE 조건용 item_id
    const sql = `UPDATE note_item SET ${updateFields.join(', ')} WHERE item_id = ?`;

    await db.runAsync(sql, updateValues);

    // 수정된 note_item 반환
    const updatedNoteItem = await getNoteItemById(itemId);
    if (!updatedNoteItem) {
      throw new Error('수정된 노트 아이템을 찾을 수 없습니다');
    }
    return updatedNoteItem;
  } catch (error) {
    console.error('❌ 노트 아이템 수정 실패:', error);
    throw error;
  }
};

// 노트 아이템 삭제
export const deleteNoteItem = async (itemId: string): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM note_item WHERE item_id = ?', [itemId]);
    return result.changes > 0; // 삭제된 행이 있으면 true
  } catch (error) {
    console.error('❌ 노트 아이템 삭제 실패:', error);
    throw error;
  }
};

// 특정 그룹의 모든 노트 아이템 삭제
export const deleteNoteItemsByGroupId = async (groupId: string): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM note_item WHERE group_id = ?', [groupId]);
    return result.changes > 0;
  } catch (error) {
    console.error('❌ 그룹별 노트 아이템 삭제 실패:', error);
    throw error;
  }
};

// 노트 그룹 전체 삭제 (개발용)
export const deleteAllNoteGroups = async (): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM note_group');
    return result.changes > 0;
  } catch (error) {
    console.error('전체 노트 그룹 삭제 실패:', error);
    throw error;
  }
};
