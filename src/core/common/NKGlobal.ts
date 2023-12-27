import { EntityManager } from 'typeorm';
import { NKConfig } from '../NKConfig';

export interface INKGlobal {
    entityManager: EntityManager;
    logger: (ns: string, ...args: any[]) => void;
    configuration: Record<keyof typeof NKConfig, any>;
    isProduction: boolean;
    allowRouters: string[];
    serviceOptions: Record<string, any>;
}

export const NKGlobal: INKGlobal = {
    entityManager: null,
    logger: null,
    configuration: null,
    isProduction: false,
    allowRouters: [],
    serviceOptions: {},
};
