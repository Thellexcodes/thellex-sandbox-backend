import { DataSource, EntityTarget, SelectQueryBuilder } from 'typeorm';

interface DynamicQueryOptions {
  page?: number;
  limit?: number;
  selectFields?: string[];
  joinRelations?: { relation: string; selectFields?: string[] }[];
  sortBy?: { field: string; order?: 'ASC' | 'DESC' }[];
  alias?: string;
}

export abstract class AbstractRepository<T> {
  protected constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<T>,
  ) {}

  /**
   * Generic dynamic query method for any entity
   */
  async findDynamic(options: DynamicQueryOptions = {}): Promise<{
    data: T[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    try {
      // Validate pagination inputs
      const page = Math.max(1, options.page ?? 1);
      const limit = Math.max(1, options.limit ?? 10);
      const offset = (page - 1) * limit;

      // Use entity table name as default alias for clarity
      const repo = this.dataSource.getRepository<T>(this.entity);
      const defaultAlias = repo.metadata.tableName;
      const alias = options.alias ?? defaultAlias;

      const query: SelectQueryBuilder<T> = repo.createQueryBuilder(alias);

      // Select fields
      const defaultFields = [`${alias}.id`];
      const fieldsToSelect =
        options.selectFields?.map((f) => `${alias}.${f}`) ?? defaultFields;
      query.select(fieldsToSelect);

      // Join relations
      const joined = new Set<string>();
      options.joinRelations?.forEach((joinOption) => {
        const parts = joinOption.relation.split('.');
        let parentAlias = alias;

        parts.forEach((part, index) => {
          const joinAlias = parts.slice(0, index + 1).join('_');

          if (!joined.has(joinAlias)) {
            query.leftJoin(`${parentAlias}.${part}`, joinAlias);
            joined.add(joinAlias);
          }

          // Only add select fields for the final relation part if specified
          if (index === parts.length - 1 && joinOption.selectFields?.length) {
            const selectFields = joinOption.selectFields.map(
              (f) => `${joinAlias}.${f}`,
            );
            query.addSelect(selectFields);
          }

          parentAlias = joinAlias;
        });
      });

      // Pagination
      query.skip(offset).take(limit);

      // Sorting
      if (options.sortBy?.length) {
        options.sortBy.forEach(({ field, order }) => {
          const sortField = field.includes('.') ? field : `${alias}.${field}`;
          query.addOrderBy(sortField, order ?? 'DESC');
        });
      } else {
        // Fallback to id if createdAt is not available
        const hasCreatedAt = repo.metadata.columns.some(
          (col) => col.propertyName === 'createdAt',
        );
        query.addOrderBy(
          hasCreatedAt ? `${alias}.createdAt` : `${alias}.id`,
          'DESC',
        );
      }

      const [items, total] = await query.getManyAndCount();

      return {
        data: items,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(
        `Error in findDynamic for entity ${this.entity.toString()}:`,
        {
          options,
          error,
        },
      );
      throw new Error(`Failed to execute query: ${error.message}`);
    }
  }
}
