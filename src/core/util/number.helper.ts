export const convertNumber = (value: string | number): number => {
    if (typeof value === 'string') {
        try {
            return Number(value);
        } catch (error) {
            return 0;
        }
    }
    return value;
};
