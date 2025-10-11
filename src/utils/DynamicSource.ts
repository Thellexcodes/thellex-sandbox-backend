import { FindOptionsWhere, Repository, SelectQueryBuilder } from 'typeorm';

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

export interface UpdateDynamicOptions {
  where: { [key: string]: any };
  updateData: { [key: string]: any };
}

export async function findOneDynamic<T>(
  repo: Repository<T>,
  options: FindDynamicOptions & { where?: { [key: string]: any } } = {},
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
      Object.entries(options.where).forEach(([key, value]) => {
        query.andWhere(`${alias}.${key} = :value`, { value });
      });
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
  options: FindManyDynamicOptions & { where?: { [key: string]: any } } = {},
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
        query.andWhere(`${alias}.${key} = :value`, { value });
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
    console.error('Error in findManyDynamic:', error);
    throw error;
  }
}

export async function updateOneDynamic<T>(
  repo: Repository<T>,
  options: UpdateDynamicOptions,
): Promise<T | null> {
  try {
    const alias = repo.metadata.tableName;
    const query: SelectQueryBuilder<T> = repo.createQueryBuilder(alias);

    // Handle where conditions
    Object.entries(options.where).forEach(([key, value]) => {
      query.andWhere(`${alias}.${key} = :value`, { value });
    });

    const entity = await query.getOne();
    if (!entity) {
      return null;
    }

    // Update the entity
    Object.assign(entity, options.updateData);
    return await repo.save(entity);
  } catch (error) {
    console.error('Error in updateOneDynamic:', error);
    throw error;
  }
}

export async function updateManyDynamic<T>(
  repo: Repository<T>,
  options: UpdateDynamicOptions,
): Promise<T[]> {
  try {
    const alias = repo.metadata.tableName;
    const query: SelectQueryBuilder<T> = repo.createQueryBuilder(alias);

    // Handle where conditions
    Object.entries(options.where).forEach(([key, value]) => {
      query.andWhere(`${alias}.${key} = :value`, { value });
    });

    const entities = await query.getMany();
    if (!entities.length) {
      return [];
    }

    // Update all entities
    entities.forEach((entity) => {
      Object.assign(entity, options.updateData);
    });

    return await repo.save(entities);
  } catch (error) {
    console.error('Error in updateManyDynamic:', error);
    throw error;
  }
}
