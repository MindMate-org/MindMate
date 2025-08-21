import { db } from '../../../hooks/use-initialize-database';

import {
  TagType,
  ContactType,
  ContactWithTagsType,
} from '@/src/features/address-book/types/address-book-type';

// 특정 연락처의 모든 태그 조회
export const getContactTags = async (contactId: number): Promise<TagType[]> => {
  try {
    const result = await db.getAllAsync(
      `
      SELECT t.id, t.name, t.color
      FROM tag t
      JOIN contact_tag ct ON t.id = ct.tag_id
      WHERE ct.contact_id = ?
      ORDER BY t.name
    `,
      [contactId],
    );

    return result as TagType[];
  } catch (error) {
    throw error;
  }
};

// 연락처와 태그 정보를 함께 조회
export const getContactWithTags = async (contactId: number): Promise<ContactWithTagsType> => {
  try {
    // 연락처 정보 조회
    const contact = (await db.getFirstAsync('SELECT * FROM contact WHERE id = ?', [
      contactId,
    ])) as ContactType;

    if (!contact) {
      throw new Error('연락처를 찾을 수 없습니다.');
    }

    // 태그 정보 조회
    const tags = await getContactTags(contactId);

    return {
      ...contact,
      tags,
    };
  } catch (error) {
    throw error;
  }
};

// 특정 태그를 가진 모든 연락처 조회
export const getContactsByTag = async (tagId: number): Promise<ContactWithTagsType[]> => {
  try {
    const result = await db.getAllAsync(
      `
      SELECT c.id, c.name, c.phone_number, c.profile_image, c.memo, c.is_me, c.created_at
      FROM contact c
      JOIN contact_tag ct ON c.id = ct.contact_id
      WHERE ct.tag_id = ?
      ORDER BY c.name
    `,
      [tagId],
    );

    const contacts = result as ContactType[];

    // 각 연락처의 태그 정보도 함께 조회
    const contactsWithTags = await Promise.all(
      contacts.map(async (contact) => {
        const tags = await getContactTags(contact.id);
        return { ...contact, tags };
      }),
    );

    return contactsWithTags;
  } catch (error) {
    throw error;
  }
};

// 모든 태그 조회 (태그 선택 시 사용)
export const getAllTags = async (): Promise<TagType[]> => {
  try {
    const result = await db.getAllAsync(`
      SELECT id, name, color
      FROM tag
      ORDER BY name
    `);

    return result as TagType[];
  } catch (error) {
    throw error;
  }
};

// 태그 사용 통계 조회 (해당 태그를 사용하는 연락처 수)
export const getTagUsageCount = async (tagId: number): Promise<number> => {
  try {
    const result = (await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM contact_tag WHERE tag_id = ?',
      [tagId],
    )) as { count: number };

    return result.count;
  } catch (error) {
    throw error;
  }
};

// 특정 연락처가 특정 태그를 가지고 있는지 확인
export const hasContactTag = async (contactId: number, tagId: number): Promise<boolean> => {
  try {
    const result = await db.getFirstAsync(
      'SELECT id FROM contact_tag WHERE contact_id = ? AND tag_id = ?',
      [contactId, tagId],
    );

    return result !== null;
  } catch (error) {
    throw error;
  }
};

// 태그 ID로 태그 조회
export const getTagById = async (tagId: number): Promise<TagType | null> => {
  try {
    const result = await db.getFirstAsync('SELECT * FROM tag WHERE id = ?', [tagId]);

    return result as TagType | null;
  } catch (error) {
    throw error;
  }
};

// 중복 태그 정리 함수 (강화 버전)
export const cleanupDuplicateTags = async (): Promise<void> => {
  try {
    // 모든 태그 조회
    const allTags = await db.getAllAsync('SELECT id, name FROM tag ORDER BY id') as TagType[];
    console.log('전체 태그:', allTags.map(tag => `${tag.name} (${tag.id})`));
    
    // 이름으로 그룹화 (대소문자 구분 없이, 공백 제거)
    const tagGroups = new Map<string, TagType[]>();
    
    allTags.forEach(tag => {
      const normalizedName = tag.name.trim().toLowerCase();
      if (!tagGroups.has(normalizedName)) {
        tagGroups.set(normalizedName, []);
      }
      tagGroups.get(normalizedName)!.push(tag);
    });
    
    // 중복이 있는 그룹 처리
    for (const [normalizedName, tags] of tagGroups) {
      if (tags.length > 1) {
        console.log(`중복 태그 발견: ${normalizedName}, IDs: ${tags.map(t => t.id).join(', ')}`);
        
        // 가장 작은 ID를 유지
        const keepTag = tags.reduce((min, current) => current.id < min.id ? current : min);
        const deleteTagIds = tags.filter(tag => tag.id !== keepTag.id).map(tag => tag.id);
        
        console.log(`유지할 태그: ${keepTag.name} (${keepTag.id}), 삭제할 태그 IDs: ${deleteTagIds.join(', ')}`);
        
        // 삭제할 태그들의 연결을 유지할 태그로 이동
        for (const deleteId of deleteTagIds) {
          // 기존 연결을 유지할 태그로 업데이트 (중복 방지)
          await db.runAsync(`
            UPDATE OR IGNORE contact_tag 
            SET tag_id = ? 
            WHERE tag_id = ?
          `, [keepTag.id, deleteId]);
          
          // 남은 중복 연결 제거
          await db.runAsync(`
            DELETE FROM contact_tag 
            WHERE tag_id = ?
          `, [deleteId]);
          
          // 중복 태그 삭제
          await db.runAsync('DELETE FROM tag WHERE id = ?', [deleteId]);
          
          }
      }
    }

    } catch (error) {
    throw error;
  }
};
