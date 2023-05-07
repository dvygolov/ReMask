export class MathHelpers {
    static average(arr) {
        const validNumbers = arr
            .map(Number)
            .filter(num => !isNaN(num));

        if (validNumbers.length === 0) {
            return 0;
        }

        const sum = validNumbers.reduce((acc, num) => acc + num, 0);
        const avg = (sum / validNumbers.length).toFixed(2);

        return parseFloat(avg);
    }

    static mathMoney(num) {
        if (typeof num !== undefined && num !== null && num !== 0) {
            num = parseFloat(num).toFixed(2) / 100;
        } else num = 0;
        return num;
    }

    static mathStat(num) {
        if (typeof num !== undefined && num !== null && num !== 0) {
            num = parseFloat(num).toFixed(2);
        } else num = 0;
        return num;
    }
}