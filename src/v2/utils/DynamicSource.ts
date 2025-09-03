import { Repository, SelectQueryBuilder } from 'typeorm';

interface SortBy {
  field: string;
  order?: 'ASC' | 'DESC';
}

interface JoinOption {
  relation: string;
  selectFields?: string[];
}

export interface FindDynamicOptions {
  page?: number;
  limit?: number;
  selectFields?: string[];
  sortBy?: SortBy[];
  joinRelations?: JoinOption[];
}

export async function findDynamic<T>(
  repo: Repository<T>,
  options: FindDynamicOptions & { where?: { [key: string]: any } } = {},
): Promise<{
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}> {
  try {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const offset = (page - 1) * limit;

    const alias = repo.metadata.tableName;
    const query: SelectQueryBuilder<T> = repo.createQueryBuilder(alias);

    // Select fields
    const defaultFields = [`${alias}.id`];
    const fieldsToSelect =
      options.selectFields?.map((f) => `${alias}.${f}`) ?? defaultFields;
    query.select(fieldsToSelect);

    // Handle joinRelations
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

        if (index === parts.length - 1 && joinOption.selectFields?.length) {
          const selectFields = joinOption.selectFields.map(
            (f) => `${joinAlias}.${f}`,
          );
          query.addSelect(selectFields);
        }

        parentAlias = joinAlias;
      });
    });

    // Handle where conditions
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query.andWhere(`${key} = :value`, { value });
      });
    }

    // Pagination
    query.skip(offset).take(limit);

    // Sorting
    if (options.sortBy?.length) {
      options.sortBy.forEach((sort) => {
        query.addOrderBy(`${alias}.${sort.field}`, sort.order ?? 'DESC');
      });
    } else {
      query.addOrderBy(`${alias}.createdAt`, 'DESC');
    }

    const [items, total] = await query.getManyAndCount();

    return {
      data: items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error in findDynamic:', error);
    throw error;
  }
}
