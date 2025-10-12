import {
  FindOptionsWhere,
  In,
  Like,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

interface SortBy {
  field: string;
  order?: 'ASC' | 'DESC';
}

interface JoinOption {
  relation: string;
  selectFields?: string[];
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

export interface BaseFindArgs {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: string | number | undefined;
  fields?: string;
  relations?: string;
}

export interface FindManyArgs extends BaseFindArgs {
  sortBy?: string;
  page?: string;
  limit?: string;
}

export function dynamicQuery<T = any>(
  type: 'findOne' | 'findMany' | 'updateOne' | 'updateMany',
  query: { [key: string]: string | number | undefined },
  updateData?: { [key: string]: any },
): FindDynamicOptions<T> | FindManyDynamicOptions<T> | UpdateDynamicOptions<T> {
  const { fields, sortBy, page, limit, relations, ...whereParams } = query;

  // Construct where clause with support for nested properties and UUIDs
  const where: { [key: string]: any } = {};
  Object.entries(whereParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key.includes('.')) {
        // Handle nested properties (e.g., 'user.id')
        const [parent, child] = key.split('.');
        where[parent] = where[parent] || {};
        where[parent][child] = value; // Keep UUID as-is for nested id
      } else if (typeof value === 'string' && value.startsWith('like:')) {
        where[key] = Like(value.replace('like:', ''));
      } else if (typeof value === 'string' && value.startsWith('in:')) {
        where[key] = In(value.replace('in:', '').split(','));
      } else {
        where[key] = value; // Keep id as-is (UUID or number)
      }
    }
  });

  if (type === 'updateOne' || type === 'updateMany') {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('updateData is required for update operations');
    }
    return {
      where: Object.keys(where).length > 0 ? where : undefined,
      updateData,
    };
  }

  const baseOptions: FindDynamicOptions<T> = {
    where: Object.keys(where).length > 0 ? where : undefined,
    selectFields: fields?.toString().split(','),
    joinRelations: relations
      ? [{ relation: relations.toString(), selectFields: ['bio', 'avatar'] }]
      : [],
  };

  if (type === 'findOne') {
    return baseOptions;
  }

  // type === 'findMany'
  let sortOptions: SortBy[] = [];
  if (sortBy) {
    try {
      const [field, order] = sortBy.toString().split(':');
      sortOptions = [{ field, order: order as 'ASC' | 'DESC' }];
    } catch (error) {
      console.warn('Invalid sortBy format, ignoring:', sortBy);
    }
  }

  return {
    ...baseOptions,
    page: parseInt(page?.toString() || '1') || 1,
    limit: parseInt(limit?.toString() || '10') || 10,
    sortBy: sortOptions.length > 0 ? sortOptions : [],
    joinRelations: relations
      ? [{ relation: relations.toString(), selectFields: ['bio', 'avatar'] }]
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
    throw new Error(`Failed to find one: ${error.message}`);
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
    throw new Error(`Failed to find many: ${error.message}`);
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
    throw new Error(`Failed to update one: ${error.message}`);
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
    throw new Error(`Failed to update many: ${error.message}`);
  }
}
