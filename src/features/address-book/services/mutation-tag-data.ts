import { hasContactTag, getTagById } from './get-tag-data';
import { db } from '../../../hooks/use-initialize-database';
import { TagType, ContactTagType } from '../types/address-book-type';

// 연락처에 태그 추가
export const addTagToContact = async (
  contactId: number,
  tagId: number,
): Promise<ContactTagType> => {
  try {
    // 이미 연결된 태그인지 확인
    const alreadyHasTag = await hasContactTag(contactId, tagId);
    if (alreadyHasTag) {
      throw new Error('이미 연결된 태그입니다.');
    }

    // 태그 연결
    const result = await db.runAsync('INSERT INTO contact_tag (contact_id, tag_id) VALUES (?, ?)', [
      contactId,
      tagId,
    ]);

    // 생성된 연결 정보 반환
    const newConnection = await db.getFirstAsync('SELECT * FROM contact_tag WHERE id = ?', [
      result.lastInsertRowId,
    ]);

    return newConnection as ContactTagType;
  } catch (error) {
    throw error;
  }
};

// 연락처에서 태그 제거
export const removeTagFromContact = async (contactId: number, tagId: number): Promise<boolean> => {
  try {
    const result = await db.runAsync(
      'DELETE FROM contact_tag WHERE contact_id = ? AND tag_id = ?',
      [contactId, tagId],
    );

    return result.changes > 0;
  } catch (error) {
    throw error;
  }
};

// 연락처의 모든 태그 제거
export const removeAllTagsFromContact = async (contactId: number): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM contact_tag WHERE contact_id = ?', [contactId]);

    return result.changes > 0;
  } catch (error) {
    throw error;
  }
};

// 새 태그 생성
export const createTag = async (tagData: Omit<TagType, 'id'>): Promise<TagType> => {
  try {
    const result = await db.runAsync('INSERT INTO tag (name, color) VALUES (?, ?)', [
      tagData.name,
      tagData.color,
    ]);

    const newTag = await db.getFirstAsync('SELECT * FROM tag WHERE id = ?', [
      result.lastInsertRowId,
    ]);

    return newTag as TagType;
  } catch (error) {
    throw error;
  }
};

// 태그 수정
export const updateTag = async (
  tagId: number,
  tagData: Partial<Omit<TagType, 'id'>>,
): Promise<TagType> => {
  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (tagData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(tagData.name);
    }
    if (tagData.color !== undefined) {
      updateFields.push('color = ?');
      updateValues.push(tagData.color);
    }

    if (updateFields.length === 0) {
      throw new Error('수정할 데이터가 없습니다.');
    }

    updateValues.push(tagId);
    const sql = `UPDATE tag SET ${updateFields.join(', ')} WHERE id = ?`;

    await db.runAsync(sql, updateValues);

    const updatedTag = await getTagById(tagId);
    if (!updatedTag) {
      throw new Error('수정된 태그를 찾을 수 없습니다.');
    }

    return updatedTag;
  } catch (error) {
    throw error;
  }
};

// 태그 삭제 (CASCADE로 연결된 contact_tag도 자동 삭제됨)
export const deleteTag = async (tagId: number): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM tag WHERE id = ?', [tagId]);
    return result.changes > 0;
  } catch (error) {
    throw error;
  }
};
