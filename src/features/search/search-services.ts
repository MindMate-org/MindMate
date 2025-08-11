import { SearchData } from './db/search-db-types';
import { SearchFormSchema } from './utils/search-form-schema';

import { db } from '@/src/hooks/use-initialize-database';
import { MediaFullType } from '@/src/lib/db/share-db-types';
import { MediaType } from '@/src/types/common-db-types';

export const fetchInsertSearch = async (data: SearchFormSchema) => {
  const { lastInsertRowId } = await db.runAsync(
    `
          INSERT INTO search (name, category, location, description)
          VALUES (?, ?, ?, ?)
        `,
    [data.name, data.category, data.location, data.description ?? null],
  );
  return lastInsertRowId;
};

// id로 Search 가져오기
export const fetchGetSearchById = async (id: number) => {
  const search = (await db.getFirstAsync(`
      SELECT * FROM search WHERE id = ${id}
    `)) as SearchData;
  return search;
};

// id로 Media 가져오기
export const fetchGetMediaById = async (id: number) => {
  const media = (await db.getAllAsync(`
      SELECT * FROM media WHERE owner_type = 'search' AND owner_id = ${id}
    `)) as MediaFullType[];
  return media;
};

// id로 search 와 media 삭제
export const fetchDeleteSearchById = async (id: number) => {
  await db.execAsync(`
      DELETE FROM search WHERE id = ${id};
      DELETE FROM media WHERE owner_type = 'search' AND owner_id = ${id}
    `);
};

// id로 search와  media Update
export const fetchUpdateSearchById = async (
  id: number,
  data: SearchFormSchema,
  media: MediaType[],
) => {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `
        UPDATE search
        SET name = ?, category = ?, location = ?, description = ?
        WHERE id = ?
      `,
      [data.name, data.category, data.location, data.description ?? null, id],
    );
    await db.runAsync(`DELETE FROM media WHERE owner_type = 'search' AND owner_id = ?`, [id]);
    if (media.length > 0) {
      await Promise.all(
        media.map((item) => {
          return db.runAsync(
            `
            INSERT INTO media (media_type, file_path, owner_type, owner_id)
            VALUES (?, ?, 'search', ?)
          `,
            [item.type ?? null, item.uri, id],
          );
        }),
      );
    }
  });
};
