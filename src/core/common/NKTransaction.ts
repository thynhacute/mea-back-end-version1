import { NKLOGGER_NS } from '../logger';
import { NKGlobal } from './NKGlobal';
import { EntityManager } from 'typeorm';

interface NKTransactionOptions {
    timeout?: number;
}

export const NKTransaction = {
    transaction: async (
        entityManager: EntityManager,
        cb: (entityManager: EntityManager) => Promise<any>,
        { timeout = 60000 }: NKTransactionOptions,
    ) => {
        return new Promise(async (resolve, reject) => {
            const queryRunner = entityManager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new Error('Transaction timed out.'));
                    }, timeout);
                });

                const res = await Promise.race([cb(queryRunner.manager), timeoutPromise]);

                await queryRunner.commitTransaction();
                return resolve(res);
            } catch (err) {
                await queryRunner.rollbackTransaction();
                NKGlobal.logger(NKLOGGER_NS.APP_DATABASE, err);

                reject(err);
            } finally {
                await queryRunner.release();
            }
        });
    },
};
