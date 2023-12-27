export const nkMoney = {
    roundNumber(number: number, decimalPlaces = 2) {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round(number * factor) / factor;
    },
};
