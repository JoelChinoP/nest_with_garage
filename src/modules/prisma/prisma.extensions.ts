import { Prisma } from './generated/client/client';

/**
 * SOFT DELETE (delete -> update)
 */
export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      delete<M, A>(
        this: M,
        args: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        const ctx = Prisma.getExtensionContext(this);

        return (ctx as any).update({
          where: args.where,
          data: {
            deletedAt: new Date(),
          },
        });
      },

      deleteMany<M, A>(
        this: M,
        args: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const ctx = Prisma.getExtensionContext(this);

        return (ctx as any).updateMany({
          where: args.where,
          data: {
            deletedAt: new Date(),
          },
        });
      },
    },
  },
});

/**
 * AUTO FILTER deletedAt IS NULL
 */
export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({
        operation,
        args,
        query,
      }: {
        operation: string;
        args: any;
        query: (args: any) => unknown;
      }) {
        if (
          operation === 'findUnique' ||
          operation === 'findFirst' ||
          operation === 'findMany' ||
          operation === 'count'
        ) {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
        }

        return query(args);
      },
    },
  },
});
