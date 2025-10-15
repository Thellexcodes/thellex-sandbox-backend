import { Injectable } from '@nestjs/common';
import {
  DataSource,
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
  relationsFields?: string;
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
  const {
    fields,
    sortBy,
    page,
    limit,
    relations,
    relationsFields,
    ...whereParams
  } = query;

  // Build where clause
  const where: { [key: string]: any } = {};
  Object.entries(whereParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        where[parent] = where[parent] || {};
        where[parent][child] = value;
      } else if (typeof value === 'string' && value.startsWith('like:')) {
        where[key] = Like(value.replace('like:', ''));
      } else if (typeof value === 'string' && value.startsWith('in:')) {
        where[key] = In(value.replace('in:', '').split(','));
      } else {
        where[key] = value;
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

  // Handle multiple and nested relations
  const joinRelations: JoinOption[] = relations
    ? relations
        .toString()
        .split(',')
        .map((relation) => ({
          relation: relation.trim(),
          selectFields: relationsFields
            ? relationsFields
                .toString()
                .split(',')
                .filter((f) => f.startsWith(`${relation}.`))
                .map((f) => f.replace(`${relation}.`, ''))
            : undefined,
        }))
    : [];

  const baseOptions: FindDynamicOptions<T> = {
    where: Object.keys(where).length > 0 ? where : undefined,
    selectFields: fields?.toString().split(','),
    joinRelations,
  };

  if (type === 'findOne') return baseOptions;

  let sortOptions: SortBy[] = [];
  if (sortBy) {
    try {
      const [field, order] = sortBy.toString().split(':');
      sortOptions = [{ field, order: order as 'ASC' | 'DESC' }];
    } catch (error) {}
  }

  return {
    ...baseOptions,
    page: parseInt(page?.toString() || '1') || 1,
    limit: parseInt(limit?.toString() || '10') || 10,
    sortBy: sortOptions.length > 0 ? sortOptions : [],
    joinRelations,
  };
}

async function applyJoinsAndSelects<T>(
  repo: Repository<T>,
  query: SelectQueryBuilder<T>,
  alias: string,
  joinRelations?: JoinOption[],
) {
  const joined = new Set<string>();

  joinRelations?.forEach((joinOption) => {
    const parts = joinOption.relation.split('.'); // e.g., 'fiatWalletProfile.wallets'
    let currentMetadata = repo.metadata;
    let parentAlias = alias;

    parts.forEach((part, index) => {
      const relation = currentMetadata.relations.find(
        (r) => r.propertyName === part,
      );
      if (!relation) {
        throw new Error(`Relation ${joinOption.relation} not found at ${part}`);
      }

      const joinAlias = parts.slice(0, index + 1).join('_');
      if (!joined.has(joinAlias)) {
        query.leftJoinAndSelect(`${parentAlias}.${part}`, joinAlias);
        joined.add(joinAlias);
      }

      // **Select fields for this relation if provided**
      if (joinOption.selectFields?.length) {
        const selectFields = joinOption.selectFields
          .filter((f) => f.startsWith(`${part}.`))
          .map((f) => `${joinAlias}.${f.replace(`${part}.`, '')}`);
        if (selectFields.length > 0) {
          query.addSelect(selectFields);
        }
      }

      parentAlias = joinAlias;
      currentMetadata = relation.inverseEntityMetadata;
    });
  });
}

export async function findOneDynamic<T>(
  repo: Repository<T>,
  options: FindDynamicOptions<T> = {},
): Promise<T | null> {
  const alias = repo.metadata.tableName;
  const query = repo.createQueryBuilder(alias);

  // Select top-level fields
  const fieldsToSelect = options.selectFields?.map((f) => `${alias}.${f}`) ?? [
    `${alias}.id`,
  ];
  query.select(fieldsToSelect);

  await applyJoinsAndSelects(repo, query, alias, options.joinRelations);

  // Apply where conditions
  if (options.where)
    Object.entries(options.where).forEach(([key, value]) => {
      query.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
    });

  return query.getOne();
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
  const alias = repo.metadata.tableName;
  const query = repo.createQueryBuilder(alias);

  // Select top-level fields
  const fieldsToSelect = options.selectFields?.map((f) => `${alias}.${f}`) ?? [
    `${alias}.id`,
  ];
  query.select(fieldsToSelect);

  await applyJoinsAndSelects(repo, query, alias, options.joinRelations);

  // Apply where
  if (options.where)
    Object.entries(options.where).forEach(([key, value]) => {
      query.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
    });

  // Pagination
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const offset = (page - 1) * limit;
  query.skip(offset).take(limit);

  // Sorting
  if (options.sortBy?.length) {
    options.sortBy.forEach((sort) =>
      query.addOrderBy(`${alias}.${sort.field}`, sort.order ?? 'DESC'),
    );
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
}

@Injectable()
export class DynamicRepositoryService {
  constructor(private readonly dataSource: DataSource) {}

  private getRepository<T>(entity: new () => T): Repository<T> {
    return this.dataSource.getRepository(entity);
  }

  async findOne<T>(args: BaseFindArgs, entity: new () => T): Promise<T | null> {
    const repo = this.getRepository(entity);
    const options = dynamicQuery<T>('findOne', args) as FindDynamicOptions<T>;
    return findOneDynamic(repo, options);
  }

  async findMany<T>(
    args: FindManyArgs,
    entity: new () => T,
  ): Promise<
    { data: T[]; total: number; page: number; lastPage: number } | T[]
  > {
    const repo = this.getRepository(entity);
    const options = dynamicQuery<T>(
      'findMany',
      args,
    ) as FindManyDynamicOptions<T>;
    return findManyDynamic(repo, options);
  }
}
