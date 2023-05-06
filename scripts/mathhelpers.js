export class MathHelpers {
    static average(arr) {
        var x, correctFactor = 0,
            sum = 0;
        for (x = 0; x < arr.length; x++) {
            arr[x] = +arr[x];
            if (!isNaN(arr[x])) {
                sum += arr[x];
            } else {
                correctFactor++;
            }
        }
        sum = (sum / (arr.length - correctFactor)).toFixed(2);
        if (isNaN(sum)) sum = 0;
        return sum;
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