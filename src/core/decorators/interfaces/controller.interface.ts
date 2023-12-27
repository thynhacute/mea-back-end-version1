import { RouterBaseMethodEnum } from '../../../core/enum/RouterBaseMethodEnum';

export interface NKCurdControllerAuthOption extends NKCurdControllerOption {
    permission?: number;
    resource?: string[];
}

export interface NKCurdControllerOption extends NKControllerOption {
    query?: {
        conditions?: string[];
        relations?: string[];
        isShowDelete?: boolean;
    };
    isAllowDelete?: boolean;
    baseMethods?: RouterBaseMethodEnum[];
}

export interface NKOpenApiControllerOption extends Pick<NKControllerOption, 'version' | 'apiName' | 'isHide'> {}

export interface NKControllerOption {
    model?: {
        type: any;
    };
    selectOptionField?: string;
    isHide?: boolean;
    version?: string;
    apiName?: string;
}
