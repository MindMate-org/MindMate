import { getContactById } from '@/src/features/address-book/services/get-contact-data';
import { getMyContact } from '@/src/features/address-book/services/get-contact-data';
import { Contact } from '@/src/features/address-book/types/address-book-type';
import { db } from '@/src/hooks/use-initialize-database';

//연락처 추가
export const createContact = async (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
  try {
    const result = await db.runAsync(
      `INSERT INTO contact (name, phone_number, profile_image, memo, is_me, created_at) 
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [
        contactData.name,
        contactData.phone_number,
        contactData.profile_image || null,
        contactData.memo || '',
        contactData.is_me,
      ],
    );

    // 생성된 contact 반환
    const newContact = await getContactById(result.lastInsertRowId.toString());
    return newContact;
  } catch (error) {
    console.error('연락처 생성 실패:', error);
    throw error;
  }
};

// 연락처 수정
export const updateContact = async (
  id: string,
  contactData: Partial<Contact>,
): Promise<Contact> => {
  try {
    // 수정할 필드들만 동적으로 SQL 생성
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (contactData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(contactData.name);
    }
    if (contactData.phone_number !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(contactData.phone_number);
    }
    if (contactData.profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      updateValues.push(contactData.profile_image);
    }
    if (contactData.memo !== undefined) {
      updateFields.push('memo = ?');
      updateValues.push(contactData.memo);
    }
    if (contactData.is_me !== undefined) {
      updateFields.push('is_me = ?');
      updateValues.push(contactData.is_me);
    }

    if (updateFields.length === 0) {
      throw new Error('수정할 데이터가 없습니다.');
    }

    updateValues.push(id); // WHERE 조건용 id
    const sql = `UPDATE contact SET ${updateFields.join(', ')} WHERE id = ?`;

    await db.runAsync(sql, updateValues);

    // 수정된 contact 반환
    const updatedContact = await getContactById(id);
    return updatedContact;
  } catch (error) {
    console.error('연락처 수정 실패:', error);
    throw error;
  }
};

// 연락처 삭제 (CASCADE로 관련 데이터도 자동 삭제됨)
export const deleteContact = async (id: string): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM contact WHERE id = ? AND is_me = 0', [id]);
    return result.changes > 0; // 삭제된 행이 있으면 true
  } catch (error) {
    console.error('연락처 삭제 실패:', error);
    throw error;
  }
};

// 내 연락처 수정 (is_me = 1인 연락처 전용)
export const updateMyContact = async (contactData: Partial<Contact>): Promise<Contact> => {
  try {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (contactData.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(contactData.name);
    }
    if (contactData.phone_number !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(contactData.phone_number);
    }
    if (contactData.profile_image !== undefined) {
      updateFields.push('profile_image = ?');
      updateValues.push(contactData.profile_image);
    }
    if (contactData.memo !== undefined) {
      updateFields.push('memo = ?');
      updateValues.push(contactData.memo);
    }

    if (updateFields.length === 0) {
      throw new Error('수정할 데이터가 없습니다.');
    }

    const sql = `UPDATE contact SET ${updateFields.join(', ')} WHERE is_me = 1`;
    await db.runAsync(sql, updateValues);

    // 수정된 내 연락처 반환
    const myContact = await getMyContact();
    return myContact;
  } catch (error) {
    console.error('내 연락처 수정 실패:', error);
    throw error;
  }
};

// 연락처 전체 삭제 (개발용, 내 연락처 제외)
export const deleteAllContacts = async (): Promise<boolean> => {
  try {
    const result = await db.runAsync('DELETE FROM contact WHERE is_me = 0');
    return result.changes > 0;
  } catch (error) {
    console.error('전체 연락처 삭제 실패:', error);
    throw error;
  }
};
