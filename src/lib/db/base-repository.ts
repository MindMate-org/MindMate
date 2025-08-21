/**
 * 기본 Repository 패턴 구현
 * - CRUD 표준화
 * - 쿼리 최적화
 * - 트랜잭션 지원
 * - 캐싱 레이어
 */
import { SQLiteDatabase } from 'expo-sqlite';
import { z } from 'zod';
import {
  BaseEntity,
  validateData,
  PaginatedResponse,
  PaginationParams,
  SortParams,
  FilterParams,
} from '../../types/api';

export interface QueryOptions {
  select?: string[];
  where?: Record<string, any>;
  orderBy?: SortParams[];
  limit?: number;
  offset?: number;
  joins?: Array<{
    table: string;
    on: string;
    type?: 'INNER' | 'LEFT' | 'RIGHT';
  }>;
}

export interface TransactionOptions {
  isolation?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
}

export abstract class BaseRepository<T extends BaseEntity> {
  protected db: SQLiteDatabase;
  protected tableName: string;
  protected schema: z.ZodSchema<T>;

  // 쿼리 캐시 (간단한 LRU 캐시)
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5분
  private readonly MAX_CACHE_SIZE = 100;

  constructor(db: SQLiteDatabase, tableName: string, schema: z.ZodSchema<T>) {
    this.db = db;
    this.tableName = tableName;
    this.schema = schema;
  }

  // ============================================================================
  // 기본 CRUD 연산
  // ============================================================================

  /**
   * ID로 단일 레코드 조회
   */
  async findById(id: number): Promise<T | null> {
    const cacheKey = `${this.tableName}:findById:${id}`;
    const cached = this.getFromCache<T>(cacheKey);
    if (cached) return cached;

    try {
      const result = await this.db.getFirstAsync<any>(
        `SELECT * FROM ${this.tableName} WHERE id = ? LIMIT 1`,
        [id],
      );

      if (!result) return null;

      const validated = validateData(this.schema, result);
      this.setCache(cacheKey, validated);

      return validated;
    } catch (error) {
      throw new Error(`Failed to find ${this.tableName} by id`);
    }
  }

  /**
   * 조건에 따른 레코드 목록 조회
   */
  async find(options: QueryOptions = {}): Promise<T[]> {
    const query = this.buildSelectQuery(options);
    const cacheKey = `${this.tableName}:find:${JSON.stringify(options)}`;
    const cached = this.getFromCache<T[]>(cacheKey);
    if (cached) return cached;

    try {
      const results = await this.db.getAllAsync<any>(query.sql, query.params);
      const validated = results.map((result) => validateData(this.schema, result));

      this.setCache(cacheKey, validated);
      return validated;
    } catch (error) {
      throw new Error(`Failed to find ${this.tableName} records`);
    }
  }

  /**
   * 페이지네이션을 지원하는 조회
   */
  async findPaginated(
    pagination: PaginationParams,
    options: QueryOptions = {},
  ): Promise<PaginatedResponse<T>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // 총 개수 조회
    const countQuery = this.buildCountQuery(options);
    const totalResult = await this.db.getFirstAsync<{ count: number }>(
      countQuery.sql,
      countQuery.params,
    );
    const total = totalResult?.count || 0;

    // 데이터 조회
    const dataOptions: QueryOptions = {
      ...options,
      limit,
      offset,
    };
    const data = await this.find(dataOptions);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 단일 레코드 생성
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const now = new Date().toISOString();
    const insertData = {
      ...data,
      created_at: now,
      updated_at: now,
    };

    const { sql, params } = this.buildInsertQuery(insertData);

    try {
      const result = await this.db.runAsync(sql, params);

      if (!result.lastInsertRowId) {
        throw new Error('Failed to get insert ID');
      }

      // 캐시 무효화
      this.invalidateCache();

      // 생성된 레코드 반환
      const created = await this.findById(result.lastInsertRowId);
      if (!created) {
        throw new Error('Failed to retrieve created record');
      }

      return created;
    } catch (error) {
      throw new Error(`Failed to create ${this.tableName}`);
    }
  }

  /**
   * 다중 레코드 생성 (배치 삽입)
   */
  async createMany(dataArray: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T[]> {
    if (dataArray.length === 0) return [];

    const now = new Date().toISOString();
    const insertDataArray = dataArray.map((data) => ({
      ...data,
      created_at: now,
      updated_at: now,
    }));

    try {
      const results: T[] = [];

      await this.transaction(async (tx) => {
        for (const insertData of insertDataArray) {
          const { sql, params } = this.buildInsertQuery(insertData);
          const result = await tx.runAsync(sql, params);

          if (result.lastInsertRowId) {
            const created = await this.findById(result.lastInsertRowId);
            if (created) {
              results.push(created);
            }
          }
        }
      });

      // 캐시 무효화
      this.invalidateCache();

      return results;
    } catch (error) {
      throw new Error(`Failed to create multiple ${this.tableName}`);
    }
  }

  /**
   * 레코드 업데이트
   */
  async update(id: number, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { sql, params } = this.buildUpdateQuery(id, updateData);

    try {
      const result = await this.db.runAsync(sql, params);

      if (result.changes === 0) {
        throw new Error('No records were updated');
      }

      // 캐시 무효화
      this.invalidateCache();

      // 업데이트된 레코드 반환
      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Failed to retrieve updated record');
      }

      return updated;
    } catch (error) {
      throw new Error(`Failed to update ${this.tableName}`);
    }
  }

  /**
   * 레코드 삭제
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db.runAsync(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);

      // 캐시 무효화
      this.invalidateCache();

      return result.changes > 0;
    } catch (error) {
      throw new Error(`Failed to delete ${this.tableName}`);
    }
  }

  /**
   * 소프트 삭제 (is_deleted 플래그 사용)
   */
  async softDelete(id: number): Promise<T> {
    return this.update(id, {
      is_deleted: 1,
      deleted_at: new Date().toISOString(),
    } as any);
  }

  // ============================================================================
  // 쿼리 빌더 메서드들
  // ============================================================================

  private buildSelectQuery(options: QueryOptions): { sql: string; params: any[] } {
    const { select, where, orderBy, limit, offset, joins } = options;

    let sql = `SELECT ${select ? select.join(', ') : '*'} FROM ${this.tableName}`;
    const params: any[] = [];

    // JOINS
    if (joins && joins.length > 0) {
      for (const join of joins) {
        const joinType = join.type || 'INNER';
        sql += ` ${joinType} JOIN ${join.table} ON ${join.on}`;
      }
    }

    // WHERE
    if (where && Object.keys(where).length > 0) {
      const conditions: string[] = [];
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
            params.push(...value);
          } else {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      });

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    // ORDER BY
    if (orderBy && orderBy.length > 0) {
      const orders = orderBy.map((sort) => `${sort.field} ${sort.direction.toUpperCase()}`);
      sql += ` ORDER BY ${orders.join(', ')}`;
    }

    // LIMIT & OFFSET
    if (limit) {
      sql += ` LIMIT ?`;
      params.push(limit);

      if (offset) {
        sql += ` OFFSET ?`;
        params.push(offset);
      }
    }

    return { sql, params };
  }

  private buildCountQuery(options: QueryOptions): { sql: string; params: any[] } {
    const { where, joins } = options;

    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params: any[] = [];

    // JOINS
    if (joins && joins.length > 0) {
      for (const join of joins) {
        const joinType = join.type || 'INNER';
        sql += ` ${joinType} JOIN ${join.table} ON ${join.on}`;
      }
    }

    // WHERE
    if (where && Object.keys(where).length > 0) {
      const conditions: string[] = [];
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
            params.push(...value);
          } else {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      });

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    return { sql, params };
  }

  private buildInsertQuery(data: any): { sql: string; params: any[] } {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?');
    const params = Object.values(data);

    const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

    return { sql, params };
  }

  private buildUpdateQuery(id: number, data: any): { sql: string; params: any[] } {
    const fields = Object.keys(data);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const params = [...Object.values(data), id];

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;

    return { sql, params };
  }

  // ============================================================================
  // 트랜잭션 지원
  // ============================================================================

  async transaction<R>(
    callback: (tx: SQLiteDatabase) => Promise<R>,
    options?: TransactionOptions,
  ): Promise<R> {
    try {
      let result: R;
      // expo-sqlite의 트랜잭션 사용
      await this.db.withTransactionAsync(async () => {
        result = await callback(this.db);
      });
      return result!;
    } catch (error) {
      throw error;
    }
  }

  // ============================================================================
  // 캐시 관리
  // ============================================================================

  private getFromCache<T>(key: string): T | null {
    const cached = this.queryCache.get(key);
    if (!cached) return null;

    // TTL 체크
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.queryCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any): void {
    // 캐시 사이즈 제한
    if (this.queryCache.size >= this.MAX_CACHE_SIZE) {
      // 가장 오래된 항목 제거
      const oldestKey = this.queryCache.keys().next().value;
      if (oldestKey) {
        this.queryCache.delete(oldestKey);
      }
    }

    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  protected invalidateCache(): void {
    this.queryCache.clear();
  }

  // ============================================================================
  // 유틸리티 메서드들
  // ============================================================================

  /**
   * 레코드 존재 여부 확인
   */
  async exists(id: number): Promise<boolean> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE id = ? LIMIT 1`,
      [id],
    );

    return (result?.count || 0) > 0;
  }

  /**
   * 조건에 맞는 레코드 수 조회
   */
  async count(where?: Record<string, any>): Promise<number> {
    const query = this.buildCountQuery({ where });
    const result = await this.db.getFirstAsync<{ count: number }>(query.sql, query.params);

    return result?.count || 0;
  }

  /**
   * 테이블의 모든 데이터 삭제 (개발용)
   */
  async truncate(): Promise<void> {
    if (!__DEV__) {
      throw new Error('Truncate is only allowed in development mode');
    }

    await this.db.execAsync(`DELETE FROM ${this.tableName}`);
    await this.db.runAsync(`DELETE FROM sqlite_sequence WHERE name = ?`, [this.tableName]);
    this.invalidateCache();
  }

  /**
   * 테이블 정보 조회
   */
  async getTableInfo(): Promise<any[]> {
    return await this.db.getAllAsync(`PRAGMA table_info(${this.tableName})`);
  }
}
