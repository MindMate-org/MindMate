/**
 * 주소록 도메인 API 서비스
 * @description 주소록 관련 데이터베이스 작업을 처리하는 통합 서비스입니다.
 */

import { ContactType, TagType, NoteGroupType } from './types/address-book-type';
import { db } from '../../hooks/use-initialize-database';

/**
 * 주소록 API 서비스 클래스
 */
export class AddressBookService {
  // ===== Contact API =====

  /**
   * 모든 연락처를 조회합니다
   * @returns Promise<ContactType[]> 연락처 목록
   */
  static async fetchGetContacts(): Promise<ContactType[]> {
    try {
      const result = await db.getAllAsync<ContactType>(
        `SELECT * FROM contact WHERE deleted_at IS NULL ORDER BY name ASC`,
      );
      return result || [];
    } catch (error) {
      console.error('연락처 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 연락처를 ID로 조회합니다
   * @param id 연락처 ID
   * @returns Promise<ContactType | null> 연락처 정보 또는 null
   */
  static async fetchGetContact(id: number): Promise<ContactType | null> {
    try {
      const result = await db.getFirstAsync<ContactType>(
        `SELECT * FROM contact WHERE id = ? AND deleted_at IS NULL`,
        [id],
      );
      return result || null;
    } catch (error) {
      console.error('연락처 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 내 연락처 정보를 조회합니다
   * @returns Promise<ContactType | null> 내 연락처 정보 또는 null
   */
  static async fetchGetMyContact(): Promise<ContactType | null> {
    try {
      const result = await db.getFirstAsync<ContactType>(
        `SELECT * FROM contact WHERE is_me = 1 AND deleted_at IS NULL`,
      );
      return result || null;
    } catch (error) {
      console.error('내 연락처 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 다른 사람들의 연락처를 조회합니다
   * @returns Promise<ContactType[]> 다른 사람들의 연락처 목록
   */
  static async fetchGetOthersContacts(): Promise<ContactType[]> {
    try {
      const result = await db.getAllAsync<ContactType>(
        `SELECT * FROM contact WHERE is_me = 0 AND deleted_at IS NULL ORDER BY name ASC`,
      );
      return result || [];
    } catch (error) {
      console.error('다른 연락처들 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새 연락처를 생성합니다
   * @param contactData 연락처 데이터
   * @returns Promise<number> 생성된 연락처 ID
   */
  static async fetchCreateContact(contactData: Omit<ContactType, 'id'>): Promise<number> {
    try {
      const now = new Date().toISOString();
      const result = await db.runAsync(
        `INSERT INTO contact (
          name, phone_number, memo, profile_image, is_me, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          contactData.name,
          contactData.phone_number,
          contactData.memo || null,
          contactData.profile_image || null,
          contactData.is_me ? 1 : 0,
          now,
          now,
        ],
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('연락처 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 연락처를 수정합니다
   * @param id 연락처 ID
   * @param updateData 수정할 데이터
   * @returns Promise<void>
   */
  static async fetchUpdateContact(
    id: number,
    updateData: Partial<Omit<ContactType, 'id' | 'created_at'>>,
  ): Promise<void> {
    try {
      const now = new Date().toISOString();

      const fields = [];
      const values = [];

      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.phone_number !== undefined) {
        fields.push('phone_number = ?');
        values.push(updateData.phone_number);
      }
      if (updateData.memo !== undefined) {
        fields.push('memo = ?');
        values.push(updateData.memo);
      }
      if (updateData.profile_image !== undefined) {
        fields.push('profile_image = ?');
        values.push(updateData.profile_image);
      }

      fields.push('updated_at = ?');
      values.push(now);
      values.push(id);

      await db.runAsync(`UPDATE contact SET ${fields.join(', ')} WHERE id = ?`, values);
    } catch (error) {
      console.error('연락처 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 연락처를 삭제합니다 (소프트 삭제)
   * @param id 연락처 ID
   * @returns Promise<void>
   */
  static async fetchDeleteContact(id: number): Promise<void> {
    try {
      const now = new Date().toISOString();
      await db.runAsync(`UPDATE contact SET deleted_at = ? WHERE id = ?`, [now, id]);
    } catch (error) {
      console.error('연락처 삭제 실패:', error);
      throw error;
    }
  }

  // ===== Tag API =====

  /**
   * 모든 태그를 조회합니다
   * @returns Promise<TagType[]> 태그 목록
   */
  static async fetchGetTags(): Promise<TagType[]> {
    try {
      const result = await db.getAllAsync<TagType>(`SELECT * FROM tag ORDER BY name ASC`);
      return result || [];
    } catch (error) {
      console.error('태그 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새 태그를 생성합니다
   * @param tagData 태그 데이터
   * @returns Promise<number> 생성된 태그 ID
   */
  static async fetchCreateTag(tagData: Omit<TagType, 'id'>): Promise<number> {
    try {
      const result = await db.runAsync(`INSERT INTO tag (name, color) VALUES (?, ?)`, [
        tagData.name,
        tagData.color || '#576BCD',
      ]);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('태그 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 태그를 수정합니다
   * @param id 태그 ID
   * @param updateData 수정할 데이터
   * @returns Promise<void>
   */
  static async fetchUpdateTag(id: number, updateData: Partial<Omit<TagType, 'id'>>): Promise<void> {
    try {
      const fields = [];
      const values = [];

      if (updateData.name !== undefined) {
        fields.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.color !== undefined) {
        fields.push('color = ?');
        values.push(updateData.color);
      }

      values.push(id);

      await db.runAsync(`UPDATE tag SET ${fields.join(', ')} WHERE id = ?`, values);
    } catch (error) {
      console.error('태그 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 태그를 삭제합니다 (관련 연락처 관계도 함께 삭제)
   * @param id 태그 ID
   * @returns Promise<void>
   */
  static async fetchDeleteTag(id: number): Promise<void> {
    try {
      // 먼저 contact_tag 관계를 삭제
      await db.runAsync(`DELETE FROM contact_tag WHERE tag_id = ?`, [id]);
      // 그다음 태그 자체를 삭제
      await db.runAsync(`DELETE FROM tag WHERE id = ?`, [id]);
    } catch (error) {
      console.error('태그 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 연락처의 태그들을 조회합니다
   * @param contactId 연락처 ID
   * @returns Promise<TagType[]> 태그 목록
   */
  static async fetchGetContactTags(contactId: number): Promise<TagType[]> {
    try {
      const result = await db.getAllAsync<TagType>(
        `SELECT t.* FROM tag t 
         JOIN contact_tag ct ON t.id = ct.tag_id 
         WHERE ct.contact_id = ?`,
        [contactId],
      );
      return result || [];
    } catch (error) {
      console.error('연락처 태그 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연락처에 태그를 추가합니다
   * @param contactId 연락처 ID
   * @param tagId 태그 ID
   * @returns Promise<void>
   */
  static async fetchAddTagToContact(contactId: number, tagId: number): Promise<void> {
    try {
      await db.runAsync(`INSERT INTO contact_tag (contact_id, tag_id) VALUES (?, ?)`, [
        contactId,
        tagId,
      ]);
    } catch (error) {
      console.error('연락처에 태그 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 연락처에서 태그를 제거합니다
   * @param contactId 연락처 ID
   * @param tagId 태그 ID
   * @returns Promise<void>
   */
  static async fetchRemoveTagFromContact(contactId: number, tagId: number): Promise<void> {
    try {
      await db.runAsync(`DELETE FROM contact_tag WHERE contact_id = ? AND tag_id = ?`, [
        contactId,
        tagId,
      ]);
    } catch (error) {
      console.error('연락처에서 태그 제거 실패:', error);
      throw error;
    }
  }

  // ===== Note Group API =====

  /**
   * 특정 연락처의 노트 그룹들을 조회합니다
   * @param contactId 연락처 ID
   * @returns Promise<NoteGroupType[]> 노트 그룹 목록
   */
  static async fetchGetNoteGroups(contactId: number): Promise<NoteGroupType[]> {
    try {
      const result = await db.getAllAsync<NoteGroupType>(
        `SELECT * FROM note_group WHERE contact_id = ? ORDER BY group_id DESC`,
        [contactId],
      );
      return result || [];
    } catch (error) {
      console.error('노트 그룹 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새 노트 그룹을 생성합니다
   * @param noteGroupData 노트 그룹 데이터
   * @returns Promise<number> 생성된 노트 그룹 ID
   */
  static async fetchCreateNoteGroup(
    noteGroupData: Omit<NoteGroupType, 'group_id'>,
  ): Promise<number> {
    try {
      const result = await db.runAsync(`INSERT INTO note_group (contact_id, title) VALUES (?, ?)`, [
        noteGroupData.contact_id,
        noteGroupData.title,
      ]);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('노트 그룹 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 노트 그룹을 수정합니다
   * @param id 노트 그룹 ID
   * @param updateData 수정할 데이터
   * @returns Promise<void>
   */
  static async fetchUpdateNoteGroup(
    id: number,
    updateData: Partial<Omit<NoteGroupType, 'group_id' | 'contact_id'>>,
  ): Promise<void> {
    try {
      const fields = [];
      const values = [];

      if (updateData.title !== undefined) {
        fields.push('title = ?');
        values.push(updateData.title);
      }

      if (fields.length === 0) {
        throw new Error('수정할 데이터가 없습니다.');
      }

      values.push(id);

      await db.runAsync(`UPDATE note_group SET ${fields.join(', ')} WHERE group_id = ?`, values);
    } catch (error) {
      console.error('노트 그룹 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 노트 그룹을 삭제합니다
   * @param id 노트 그룹 ID
   * @returns Promise<void>
   */
  static async fetchDeleteNoteGroup(id: number): Promise<void> {
    try {
      await db.runAsync(`DELETE FROM note_group WHERE group_id = ?`, [id]);
    } catch (error) {
      console.error('노트 그룹 삭제 실패:', error);
      throw error;
    }
  }
}

// Backward compatibility - deprecated functions
// These will be removed in future versions

/**
 * @deprecated Use AddressBookService.fetchGetMyContact instead
 */
export const getMyContact = AddressBookService.fetchGetMyContact;

/**
 * @deprecated Use AddressBookService.fetchGetOthersContacts instead
 */
export const getOthersContacts = AddressBookService.fetchGetOthersContacts;

/**
 * @deprecated Use AddressBookService.fetchGetContact instead
 */
export const getContactById = AddressBookService.fetchGetContact;

/**
 * @deprecated Use AddressBookService.fetchCreateContact instead
 */
export const createContact = AddressBookService.fetchCreateContact;

/**
 * @deprecated Use AddressBookService.fetchUpdateContact instead
 */
export const updateContact = AddressBookService.fetchUpdateContact;
