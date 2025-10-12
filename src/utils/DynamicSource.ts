import { FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';

interface SortBy {
  field: string;
  order?: 'ASC' | 'DESC';
}

interface JoinOption {
  relation: string;
  selectFields?: string[];
}

export interface BaseFindArgs {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: string | undefined;
  fields?: string;
  relations?: string;
}

export interface FindManyArgs extends BaseFindArgs {
  sortBy?: string;
  page?: string;
  limit?: string;
}

export interface FindDynamicOptions<T = any> {
  selectFields?: string[];
  joinRelations?: JoinOption[];
  where?: FindOptionsWhere<T> | { [key: string]: any };
}

export interface FindManyDynamicOptions<T = any> extends FindDynamicOptions<T> {
  page?: number;
  limit?: number;
  sortBy?: SortBy[];
}

export interface UpdateDynamicOptions<T = any> {
  where?: FindOptionsWhere<T> | { [key: string]: any };
  updateData: { [key: string]: any };
}

export type DynamicReturnType<T> = Promise<
  FindDynamicOptions<T> | FindManyDynamicOptions<T[]>
>;

export function dynamicQuery<T = any>(
  type: 'findOne' | 'findMany' | 'updateOne' | 'updateMany',
  query: { [key: string]: string | undefined },
  updateData?: { [key: string]: any },
): FindDynamicOptions<T> | FindManyDynamicOptions<T> | UpdateDynamicOptions<T> {
  const { fields, sortBy, page, limit, relations, ...whereParams } = query;

  // Construct where clause from all non-reserved query parameters
  const where: { [key: string]: any } = {};
  Object.entries(whereParams).forEach(([key, value]) => {
    if (value) {
      where[key] = key === 'id' ? parseInt(value) : value;
    }
  });

  if (type === 'updateOne' || type === 'updateMany') {
    return {
      where: Object.keys(where).length > 0 ? where : undefined,
      updateData: updateData || {},
    };
  }

  const baseOptions: FindDynamicOptions<T> = {
    where: Object.keys(where).length > 0 ? where : undefined,
    selectFields: fields?.split(','),
    joinRelations: relations
      ? [{ relation: relations, selectFields: ['bio', 'avatar'] }]
      : [],
  };

  if (type === 'findOne') {
    return baseOptions;
  }

  // type === 'findMany'
  return {
    ...baseOptions,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sortBy: sortBy
      ? [
          {
            field: sortBy.split(':')[0],
            order: sortBy.split(':')[1] as 'ASC' | 'DESC',
          },
        ]
      : [],
    joinRelations: relations
      ? [{ relation: relations, selectFields: ['bio', 'avatar'] }]
      : [{ relation: 'profile', selectFields: ['bio', 'avatar'] }],
  };
}

export async function findOneDynamic<T>(
  repo: Repository<T>,
  options: FindDynamicOptions<T> = {},
): Promise<T | null> {
  try {
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
      query.andWhere(options.where);
    }

    // Default sorting
    query.addOrderBy(`${alias}.createdAt`, 'DESC');

    return await query.getOne();
  } catch (error) {
    console.error('Error in findOneDynamic:', error);
    throw error;
  }
}

export async function findManyDynamic<T>(
  repo: Repository<T>,
  options: FindManyDynamicOptions<T> = {},
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
      query.andWhere(options.where);
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
    console.error('Error in findManyDynamic:', error);
    throw error;
  }
}

export async function updateOneDynamic<T>(
  repo: Repository<T>,
  options: UpdateDynamicOptions<T>,
): Promise<T | null> {
  try {
    const alias = repo.metadata.tableName;
    const query: SelectQueryBuilder<T> = repo.createQueryBuilder(alias);

    if (options.where) {
      query.andWhere(options.where);
    }

    const entity = await query.getOne();
    if (!entity) {
      return null;
    }

    Object.assign(entity, options.updateData);
    return await repo.save(entity);
  } catch (error) {
    console.error('Error in updateOneDynamic:', error);
    throw error;
  }
}

export async function updateManyDynamic<T>(
  repo: Repository<T>,
  options: UpdateDynamicOptions<T>,
): Promise<T[]> {
  try {
    const alias = repo.metadata.tableName;
    const query: SelectQueryBuilder<T> = repo.createQueryBuilder(alias);

    if (options.where) {
      query.andWhere(options.where);
    }

    const entities = await query.getMany();
    if (!entities.length) {
      return [];
    }

    entities.forEach((entity) => {
      Object.assign(entity, options.updateData);
    });

    return await repo.save(entities);
  } catch (error) {
    console.error('Error in updateManyDynamic:', error);
    throw error;
  }
}
