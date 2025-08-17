import {
  DiaryTableType,
  MediaTableType,
  DiaryCreateDbPayloadType,
  DiaryUpdateDbPayloadType,
  MediaCreateDbPayloadType,
  DiaryWithMediaType,
  DiarySearchDbFilterType,
} from './db/diary-db-types';
import { db } from '../../hooks/use-initialize-database';

/**
 * 일기 관련 데이터베이스 작업을 처리하는 서비스 클래스
 *
 * 이 클래스는 일기 CRUD 작업, 미디어 관리, 검색, 통계 등의 기능을 제공합니다.
 * 모든 메서드는 정적 메서드로 구현되어 인스턴스 생성 없이 사용할 수 있습니다.
 *
 * @example
 * ```typescript
 * // 일기 생성
 * const diaryId = await DiaryService.createDiary({
 *   title: '오늘의 일기',
 *   body: '좋은 하루였다',
 *   mood: 'happy'
 * });
 *
 * // 일기 조회
 * const diary = await DiaryService.getDiaryById(diaryId);
 * ```
 */
export class DiaryService {
  /**
   * 모든 일기를 최신순으로 조회합니다
   *
   * @returns Promise<DiaryTableType[]> 일기 목록 배열 (최신순 정렬)
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const diaries = await DiaryService.getAllDiaries();
   * console.log(`총 ${diaries.length}개의 일기가 있습니다`);
   * ```
   */
  /**
   * 모든 일기를 최신순으로 조회합니다
   * @returns Promise<DiaryTableType[]> 일기 목록 배열 (최신순 정렬)
   * @throws {Error} 데이터베이스 조회 실패 시
   */
  static async fetchGetDiaries(): Promise<DiaryTableType[]> {
    try {
      const result = await db.getAllAsync<DiaryTableType>(
        `SELECT * FROM diaries WHERE deleted_at IS NULL ORDER BY created_at DESC`,
      );
      return result || [];
    } catch (error) {
      console.error('일기 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * @deprecated Use fetchGetDiaries instead
   */
  static async getAllDiaries(): Promise<DiaryTableType[]> {
    return this.fetchGetDiaries();
  }

  /**
   * 특정 ID의 일기를 조회합니다
   *
   * @param id - 조회할 일기의 고유 ID
   * @returns Promise<DiaryTableType | null> 일기 정보 또는 존재하지 않을 경우 null
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const diary = await DiaryService.getDiaryById(123);
   * if (diary) {
   *   console.log(diary.title);
   * } else {
   *   console.log('일기를 찾을 수 없습니다');
   * }
   * ```
   */
  static async getDiaryById(id: number): Promise<DiaryTableType | null> {
    try {
      const result = await db.getFirstAsync<DiaryTableType>(
        `SELECT * FROM diaries WHERE id = ? AND deleted_at IS NULL`,
        [id],
      );
      return result || null;
    } catch (error) {
      console.error('일기 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 다양한 필터 조건을 사용하여 일기를 검색합니다
   *
   * @param filter - 검색 필터 옵션 객체
   * @param filter.keyword - 제목 또는 내용에서 검색할 키워드
   * @param filter.startDate - 검색 시작 날짜 (ISO 문자열)
   * @param filter.endDate - 검색 종료 날짜 (ISO 문자열)
   * @param filter.mood - 특정 기분으로 필터링
   * @param filter.hasMedia - 미디어 포함 여부 (true: 미디어 있음, false: 미디어 없음)
   * @param filter.orderBy - 정렬 기준 컬럼명
   * @param filter.orderDirection - 정렬 방향 ('ASC' | 'DESC')
   * @param filter.limit - 결과 제한 개수
   * @param filter.offset - 페이지네이션 오프셋
   * @returns Promise<DiaryTableType[]> 필터 조건에 맞는 일기 목록
   * @throws {Error} 데이터베이스 검색 실패 시
   *
   * @example
   * ```typescript
   * // 키워드 검색
   * const results = await DiaryService.searchDiaries({
   *   keyword: '여행',
   *   mood: 'happy',
   *   hasMedia: true
   * });
   *
   * // 날짜 범위 검색
   * const recentDiaries = await DiaryService.searchDiaries({
   *   startDate: '2023-01-01',
   *   endDate: '2023-12-31',
   *   orderBy: 'created_at',
   *   orderDirection: 'DESC'
   * });
   * ```
   */
  static async searchDiaries(
    filter: DiarySearchDbFilterType,
  ): Promise<(DiaryTableType & { media_uri: string | null; media_type: string | null })[]> {
    try {
      let query = `SELECT DISTINCT d.*, 
                  COALESCE(img.file_path, vid.file_path) as media_uri,
                  COALESCE(img.media_type, vid.media_type) as media_type
           FROM diaries d
           LEFT JOIN (
             SELECT owner_id, file_path, media_type, MIN(id) as min_id
             FROM media
             WHERE owner_type = 'diary' AND media_type = 'image'
             GROUP BY owner_id
           ) img ON img.owner_id = d.id
           LEFT JOIN (
             SELECT owner_id, file_path, media_type, MIN(id) as min_id
             FROM media
             WHERE owner_type = 'diary' AND media_type = 'video'
             GROUP BY owner_id
           ) vid ON vid.owner_id = d.id AND img.owner_id IS NULL`;

      const conditions: string[] = [];
      const params: any[] = [];

      // 미디어 포함 여부 필터를 위한 추가 조인
      let hasMediaJoin = '';
      if (filter.hasMedia !== undefined) {
        hasMediaJoin = ` LEFT JOIN media m_filter ON m_filter.owner_type = 'diary' AND m_filter.owner_id = d.id`;
        query += hasMediaJoin;
      }

      // 날짜 범위 필터
      if (filter.startDate) {
        conditions.push(`d.created_at >= ?`);
        params.push(filter.startDate);
      }
      if (filter.endDate) {
        conditions.push(`d.created_at <= ?`);
        params.push(filter.endDate);
      }

      // 기분 필터
      if (filter.mood) {
        conditions.push(`d.mood = ?`);
        params.push(filter.mood);
      }

      // 키워드 검색
      if (filter.keyword) {
        conditions.push(`(d.title LIKE ? OR d.body LIKE ?)`);
        params.push(`%${filter.keyword}%`, `%${filter.keyword}%`);
      }

      // 미디어 포함 필터
      if (filter.hasMedia === true) {
        conditions.push(`m_filter.id IS NOT NULL`);
      } else if (filter.hasMedia === false) {
        conditions.push(`m_filter.id IS NULL`);
      }

      // 삭제되지 않은 일기만 검색
      conditions.push('d.deleted_at IS NULL');

      // WHERE 절 추가
      query += ` WHERE ${conditions.join(' AND ')}`;

      // 정렬
      const orderBy = filter.orderBy || 'created_at';
      const orderDirection = filter.orderDirection || 'DESC';
      query += ` ORDER BY d.${orderBy} ${orderDirection}`;

      // 페이지네이션
      if (filter.limit) {
        query += ` LIMIT ?`;
        params.push(filter.limit);
        if (filter.offset) {
          query += ` OFFSET ?`;
          params.push(filter.offset);
        }
      }

      const result = await db.getAllAsync<
        DiaryTableType & { media_uri: string | null; media_type: string | null }
      >(query, params);
      return result || [];
    } catch (error) {
      console.error('일기 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 새로운 일기를 데이터베이스에 생성합니다
   *
   * @param input - 일기 생성에 필요한 데이터
   * @param input.title - 일기 제목
   * @param input.body - 일기 내용
   * @param input.font - 폰트 종류 (기본값: 'default')
   * @param input.fontSize - 폰트 크기 (기본값: 16)
   * @param input.textAlign - 텍스트 정렬 (기본값: 'left')
   * @param input.textColor - 텍스트 색상
   * @param input.backgroundColor - 배경 색상
   * @param input.audioUri - 음성 파일 경로
   * @param input.mood - 기분 상태
   * @returns Promise<number> 생성된 일기의 고유 ID
   * @throws {Error} 데이터베이스 생성 실패 시
   *
   * @example
   * ```typescript
   * const diaryId = await DiaryService.createDiary({
   *   title: '오늘의 일기',
   *   body: '좋은 하루를 보냈다',
   *   mood: 'happy',
   *   backgroundColor: '#FFE4E1'
   * });
   * console.log(`새 일기가 생성되었습니다. ID: ${diaryId}`);
   * ```
   */
  static async createDiary(input: DiaryCreateDbPayloadType): Promise<number> {
    try {
      const now = new Date().toISOString();

      if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다');
      }

      console.log('일기 생성 시도:', { title: input.title, mood: input.mood });

      const result = await db.runAsync(
        `INSERT INTO diaries (
          title, body, font, font_size, text_align, text_color, 
          background_color, audio_uri, mood, created_at, updated_at, deleted_at, is_favorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.title,
          input.body,
          input.font || 'default',
          input.fontSize || 16,
          input.textAlign || 'left',
          input.textColor || null,
          input.backgroundColor || null,
          input.audioUri || null,
          input.mood || null,
          now,
          now,
          null, // deleted_at
          0, // is_favorite
        ],
      );

      console.log('일기 생성 성공:', result.lastInsertRowId);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('일기 생성 실패:', error);
      console.error('Input data:', input);
      throw error;
    }
  }

  /**
   * 일기와 대표 미디어를 함께 조회합니다 (목록 화면용)
   *
   * 썸네일 미디어 우선순위: 이미지 > 동영상 > 없음
   * COALESCE를 사용하여 이미지가 있으면 이미지를, 없으면 동영상을 대표 미디어로 선택합니다.
   *
   * @returns Promise<(DiaryTableType & { media_uri: string | null; media_type: string | null })[]>
   *          일기 목록과 우선순위에 따른 미디어 정보를 포함한 배열
   * @throws {Error} 데이터베이스 조회 실패 시 빈 배열 반환
   *
   * @example
   * ```typescript
   * const diariesWithMedia = await DiaryService.getAllDiariesWithMedia();
   * diariesWithMedia.forEach(diary => {
   *   console.log(`${diary.title}: ${diary.media_uri ? '미디어 있음' : '미디어 없음'}`);
   * });
   * ```
   */
  static async getAllDiariesWithMedia(): Promise<
    (DiaryTableType & { media_uri: string | null; media_type: string | null })[]
  > {
    try {
      if (!db) {
        const errorMsg = '데이터베이스가 초기화되지 않았습니다';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      console.log('일기+미디어 조회 시작');

      // 최적화된 쿼리: CTE(Common Table Expression) 사용하여 성능 개선
      const result = await db.getAllAsync<
        DiaryTableType & { media_uri: string | null; media_type: string | null }
      >(
        `WITH media_priority AS (
           SELECT 
             owner_id,
             file_path,
             media_type,
             ROW_NUMBER() OVER (
               PARTITION BY owner_id 
               ORDER BY 
                 CASE media_type 
                   WHEN 'image' THEN 1 
                   WHEN 'video' THEN 2 
                   ELSE 3 
                 END, 
                 id
             ) as rn
           FROM media
           WHERE owner_type = 'diary'
         )
         SELECT d.*, 
                mp.file_path as media_uri,
                mp.media_type
         FROM diaries d
         LEFT JOIN media_priority mp ON mp.owner_id = d.id AND mp.rn = 1
         WHERE d.deleted_at IS NULL
         ORDER BY 
           CASE WHEN d.updated_at IS NOT NULL THEN d.updated_at ELSE d.created_at END DESC`,
      );

      console.log(`일기+미디어 조회 완료: ${result?.length || 0}개`);
      return result || [];
    } catch (error) {
      console.error('일기+미디어 조회 실패 - 상세 정보:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      // 에러를 상위로 던져서 UI에서 적절히 처리할 수 있도록 함
      throw error;
    }
  }

  /**
   * 기존 일기의 정보를 수정합니다
   *
   * 제공된 필드만 업데이트되며, undefined인 필드는 변경되지 않습니다.
   * updated_at 필드는 자동으로 현재 시간으로 갱신됩니다.
   *
   * @param input - 일기 수정에 필요한 데이터
   * @param input.id - 수정할 일기의 ID (필수)
   * @param input.title - 새로운 제목 (선택)
   * @param input.body - 새로운 내용 (선택)
   * @param input.font - 새로운 폰트 (선택)
   * @param input.fontSize - 새로운 폰트 크기 (선택)
   * @param input.textAlign - 새로운 텍스트 정렬 (선택)
   * @param input.textColor - 새로운 텍스트 색상 (선택)
   * @param input.backgroundColor - 새로운 배경 색상 (선택)
   * @param input.audioUri - 새로운 음성 파일 경로 (선택)
   * @param input.mood - 새로운 기분 상태 (선택)
   * @returns Promise<void>
   * @throws {Error} 데이터베이스 수정 실패 시
   *
   * @example
   * ```typescript
   * await DiaryService.updateDiary({
   *   id: 123,
   *   title: '수정된 제목',
   *   mood: 'excited'
   * });
   * ```
   */
  static async updateDiary(input: DiaryUpdateDbPayloadType): Promise<void> {
    try {
      const now = new Date().toISOString();
      const updateFields: string[] = [];
      const params: any[] = [];

      // 업데이트할 필드 동적 생성
      if (input.title !== undefined) {
        updateFields.push('title = ?');
        params.push(input.title);
      }
      if (input.body !== undefined) {
        updateFields.push('body = ?');
        params.push(input.body);
      }
      if (input.font !== undefined) {
        updateFields.push('font = ?');
        params.push(input.font);
      }
      if (input.fontSize !== undefined) {
        updateFields.push('font_size = ?');
        params.push(input.fontSize);
      }
      if (input.textAlign !== undefined) {
        updateFields.push('text_align = ?');
        params.push(input.textAlign);
      }
      if (input.textColor !== undefined) {
        updateFields.push('text_color = ?');
        params.push(input.textColor);
      }
      if (input.backgroundColor !== undefined) {
        updateFields.push('background_color = ?');
        params.push(input.backgroundColor);
      }
      if (input.audioUri !== undefined) {
        updateFields.push('audio_uri = ?');
        params.push(input.audioUri);
      }
      if (input.mood !== undefined) {
        updateFields.push('mood = ?');
        params.push(input.mood);
      }

      updateFields.push('updated_at = ?');
      params.push(now);

      params.push(input.id);

      await db.runAsync(`UPDATE diaries SET ${updateFields.join(', ')} WHERE id = ?`, params);
    } catch (error) {
      console.error('일기 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 일기를 휴지통으로 이동합니다 (소프트 삭제)
   *
   * deleted_at 컬럼에 현재 시간을 설정하여 일기를 숨깁니다.
   * 실제로는 데이터가 삭제되지 않으므로 나중에 복원할 수 있습니다.
   *
   * @param id - 삭제할 일기의 고유 ID
   * @returns Promise<void>
   * @throws {Error} 데이터베이스 삭제 실패 시
   *
   * @example
   * ```typescript
   * await DiaryService.deleteDiary(123);
   * console.log('일기가 휴지통으로 이동되었습니다');
   * ```
   */
  static async deleteDiary(id: number): Promise<void> {
    try {
      const now = new Date().toISOString();
      await db.runAsync(`UPDATE diaries SET deleted_at = ? WHERE id = ?`, [now, id]);
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 일기를 완전히 삭제합니다 (하드 삭제)
   *
   * deleteDiary와 동일한 기능을 수행합니다.
   * 미디어 테이블의 관련 데이터도 CASCADE로 자동 삭제됩니다.
   *
   * @param id - 삭제할 일기의 고유 ID
   * @returns Promise<void>
   * @throws {Error} 데이터베이스 삭제 실패 시
   */
  static async permanentDeleteDiary(id: number): Promise<void> {
    try {
      // media 테이블의 관련 데이터도 CASCADE로 자동 삭제됨
      await db.runAsync(`DELETE FROM diaries WHERE id = ?`, [id]);
    } catch (error) {
      console.error('일기 영구 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 휴지통에서 일기를 복원합니다
   *
   * deleted_at 컬럼을 NULL로 설정하여 일기를 다시 표시합니다.
   *
   * @param id - 복원할 일기의 ID
   * @returns Promise<void>
   * @throws {Error} 데이터베이스 복원 실패 시
   *
   * @example
   * ```typescript
   * await DiaryService.restoreDiary(123);
   * console.log('일기가 복원되었습니다');
   * ```
   */
  static async restoreDiary(id: number): Promise<void> {
    try {
      await db.runAsync(`UPDATE diaries SET deleted_at = NULL WHERE id = ?`, [id]);
    } catch (error) {
      console.error('일기 복원 실패:', error);
      throw error;
    }
  }

  /**
   * 휴지통 일기 목록을 조회합니다
   *
   * deleted_at이 NULL이 아닌 일기들을 반환합니다.
   * 삭제된 순서대로 정렬하여 반환합니다.
   *
   * @returns Promise<DiaryTableType[]> 삭제된 일기 목록
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const deletedDiaries = await DiaryService.getDeletedDiaries();
   * console.log(`휴지통에 ${deletedDiaries.length}개의 일기가 있습니다`);
   * ```
   */
  static async getDeletedDiaries(): Promise<DiaryTableType[]> {
    try {
      const result = await db.getAllAsync<DiaryTableType>(
        `SELECT * FROM diaries WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`,
      );
      return result || [];
    } catch (error) {
      console.error('휴지통 일기 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 휴지통 일기 목록을 미디어 정보와 함께 조회합니다
   *
   * deleted_at이 NULL이 아닌 일기들과 해당 미디어를 반환합니다.
   * 삭제된 순서대로 정렬하여 반환합니다.
   *
   * @returns Promise<(DiaryTableType & { media_uri: string | null; media_type: string | null })[]>
   * 삭제된 일기 목록 (미디어 정보 포함)
   * @throws {Error} 데이터베이스 조회 실패 시
   */
  static async getDeletedDiariesWithMedia(): Promise<
    (DiaryTableType & { media_uri: string | null; media_type: string | null })[]
  > {
    try {
      if (!db) {
        throw new Error('데이터베이스가 초기화되지 않았습니다');
      }

      const result = await db.getAllAsync<
        DiaryTableType & { media_uri: string | null; media_type: string | null }
      >(
        `SELECT d.*, 
                COALESCE(img.file_path, vid.file_path) as media_uri,
                COALESCE(img.media_type, vid.media_type) as media_type
         FROM diaries d
         LEFT JOIN (
           SELECT owner_id, file_path, media_type, MIN(id) as min_id
           FROM media
           WHERE owner_type = 'diary' AND media_type = 'image'
           GROUP BY owner_id
         ) img ON img.owner_id = d.id
         LEFT JOIN (
           SELECT owner_id, file_path, media_type, MIN(id) as min_id
           FROM media
           WHERE owner_type = 'diary' AND media_type = 'video'
           GROUP BY owner_id
         ) vid ON vid.owner_id = d.id AND img.owner_id IS NULL
         WHERE d.deleted_at IS NOT NULL
         ORDER BY d.deleted_at DESC`,
      );

      return result || [];
    } catch (error) {
      console.error('휴지통 일기+미디어 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 일기 북마크 상태를 토글합니다
   *
   * is_favorite 컬럼의 값을 0과 1 사이에서 토글합니다.
   *
   * @param id - 일기 ID
   * @returns Promise<boolean> 변경된 북마크 상태 (true: 북마크, false: 일반)
   * @throws {Error} 데이터베이스 업데이트 실패 시
   *
   * @example
   * ```typescript
   * const isFavorite = await DiaryService.toggleFavorite(123);
   * console.log(`일기가 ${isFavorite ? '북마크에 추가' : '북마크에서 제거'}되었습니다`);
   * ```
   */
  static async toggleFavorite(id: number): Promise<boolean> {
    try {
      // 현재 상태 조회
      const current = await db.getFirstAsync<{ is_favorite: number }>(
        `SELECT is_favorite FROM diaries WHERE id = ?`,
        [id],
      );

      if (!current) {
        throw new Error('일기를 찾을 수 없습니다');
      }

      // 상태 토글
      const newFavoriteState = current.is_favorite ? 0 : 1;
      await db.runAsync(`UPDATE diaries SET is_favorite = ? WHERE id = ?`, [newFavoriteState, id]);

      return newFavoriteState === 1;
    } catch (error) {
      console.error('북마크 토글 실패:', error);
      throw error;
    }
  }

  /**
   * 북마크 일기 목록을 조회합니다
   *
   * is_favorite이 1인 일기들을 최신순으로 반환합니다.
   * 삭제된 일기는 제외됩니다.
   *
   * @returns Promise<DiaryTableType[]> 북마크 일기 목록
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const favoriteDiaries = await DiaryService.getFavoriteDiaries();
   * console.log(`${favoriteDiaries.length}개의 북마크 일기가 있습니다`);
   * ```
   */
  static async getFavoriteDiaries(): Promise<DiaryTableType[]> {
    try {
      const result = await db.getAllAsync<DiaryTableType>(
        `SELECT * FROM diaries WHERE is_favorite = 1 AND deleted_at IS NULL ORDER BY updated_at DESC, created_at DESC`,
      );
      return result || [];
    } catch (error) {
      console.error('북마크 일기 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 일기에 연결된 모든 미디어 파일을 조회합니다
   *
   * @param diaryId - 미디어를 조회할 일기의 ID
   * @returns Promise<MediaTableType[]> 해당 일기의 미디어 파일 목록
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const media = await DiaryService.getMediaByDiaryId(123);
   * console.log(`${media.length}개의 미디어 파일이 있습니다`);
   * ```
   */
  static async getMediaByDiaryId(diaryId: number): Promise<MediaTableType[]> {
    try {
      const result = await db.getAllAsync<MediaTableType>(
        `SELECT 
          id, 
          owner_type, 
          owner_id, 
          media_type, 
          file_path, 
          created_at
        FROM media 
        WHERE owner_type = 'diary' AND owner_id = ?`,
        [diaryId],
      );
      return result || [];
    } catch (error) {
      console.error('미디어 파일 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 일기와 연결된 모든 미디어 정보를 함께 조회합니다
   *
   * @param id - 조회할 일기의 ID
   * @returns Promise<DiaryWithMediaType | null> 일기 정보와 미디어 배열을 포함한 객체, 또는 null
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const diaryWithMedia = await DiaryService.getDiaryWithMedia(123);
   * if (diaryWithMedia) {
   *   console.log(`제목: ${diaryWithMedia.title}`);
   *   console.log(`미디어 개수: ${diaryWithMedia.media.length}`);
   * }
   * ```
   */
  static async getDiaryWithMedia(id: number): Promise<DiaryWithMediaType | null> {
    try {
      const diary = await this.getDiaryById(id);
      if (!diary) return null;

      const media = await this.getMediaByDiaryId(id);
      return { ...diary, media };
    } catch (error) {
      console.error('일기 상세 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새로운 미디어 파일을 데이터베이스에 추가합니다
   *
   * @param input - 미디어 생성에 필요한 데이터
   * @param input.ownerType - 소유자 타입 (예: 'diary')
   * @param input.ownerId - 소유자 ID (일기 ID)
   * @param input.mediaType - 미디어 타입 ('image' | 'video' | 'audio')
   * @param input.filePath - 파일 경로
   * @returns Promise<number> 생성된 미디어의 고유 ID
   * @throws {Error} 데이터베이스 생성 실패 시
   *
   * @example
   * ```typescript
   * const mediaId = await DiaryService.addMedia({
   *   ownerType: 'diary',
   *   ownerId: 123,
   *   mediaType: 'image',
   *   filePath: '/path/to/image.jpg'
   * });
   * ```
   */
  static async addMedia(input: MediaCreateDbPayloadType): Promise<number> {
    try {
      const result = await db.runAsync(
        `INSERT INTO media (owner_type, owner_id, media_type, file_path) 
         VALUES (?, ?, ?, ?)`,
        [input.owner_type, input.owner_id, input.media_type, input.file_path],
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('미디어 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 데이터베이스에서 미디어 파일 정보를 삭제합니다
   *
   * 주의: 실제 파일 시스템의 파일은 삭제되지 않으며, 데이터베이스 레코드만 삭제됩니다.
   *
   * @param id - 삭제할 미디어의 고유 ID
   * @returns Promise<void>
   * @throws {Error} 데이터베이스 삭제 실패 시
   *
   * @example
   * ```typescript
   * await DiaryService.deleteMedia(456);
   * console.log('미디어가 삭제되었습니다');
   * ```
   */
  static async deleteMedia(id: number): Promise<void> {
    try {
      await db.runAsync(`DELETE FROM media WHERE id = ?`, [id]);
    } catch (error) {
      console.error('미디어 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 일기 관련 통계 정보를 조회합니다
   *
   * @returns Promise<{total: number; byMood: Record<string, number>; withMedia: number}>
   *          통계 객체 (전체 일기 수, 기분별 통계, 미디어 포함 일기 수)
   * @throws {Error} 데이터베이스 조회 실패 시
   *
   * @example
   * ```typescript
   * const stats = await DiaryService.getDiaryStats();
   * console.log(`전체 일기: ${stats.total}개`);
   * console.log(`행복한 일기: ${stats.byMood.happy || 0}개`);
   * console.log(`미디어 포함 일기: ${stats.withMedia}개`);
   * ```
   */
  static async getDiaryStats(): Promise<{
    total: number;
    byMood: Record<string, number>;
    withMedia: number;
  }> {
    try {
      // 전체 일기 수 (삭제되지 않은 것만)
      const totalResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM diaries WHERE deleted_at IS NULL`,
      );

      // 기분별 통계 (삭제되지 않은 것만)
      const moodResult = await db.getAllAsync<{ mood: string; count: number }>(
        `SELECT mood, COUNT(*) as count FROM diaries WHERE mood IS NOT NULL AND deleted_at IS NULL GROUP BY mood`,
      );

      // 미디어 포함 일기 수 (삭제되지 않은 것만)
      const mediaResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(DISTINCT m.owner_id) as count 
         FROM media m 
         JOIN diaries d ON m.owner_id = d.id 
         WHERE m.owner_type = 'diary' AND d.deleted_at IS NULL`,
      );

      const byMood: Record<string, number> = {};
      moodResult?.forEach((row) => {
        byMood[row.mood] = row.count;
      });

      return {
        total: totalResult?.count || 0,
        byMood,
        withMedia: mediaResult?.count || 0,
      };
    } catch (error) {
      console.error('일기 통계 조회 실패:', error);
      throw error;
    }
  }
}
