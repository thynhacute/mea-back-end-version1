export interface XLSXIncorrectItem<T> {
    data: T;
    errors: XLSXErrorMessage[];
}

export interface XLSXErrorMessage {
    column: string;
    message: string;
    color: string;
}

export interface XLSXImportPlanItem {
    name: number;
    code: string;
    machine: string;
    category: string;
    brand: string;
    description: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
    contact: string;
}

export interface XLSXImportInventoryItem {
    name: string;
    code: string;
    category: string;
    mfd: string;
    expiredDate: string;
    warrantyDate: string;
    description: string;
    quantity: string;
    unit: string;
    price: string;
}
