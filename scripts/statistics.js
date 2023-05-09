import {TableFormatter} from "./tableformatter.js";
import {Requests} from "./requests.js";
import {AdAccount} from "./adaccount.js";

export async function loadAllStatistics() {
    let datetime = document.getElementById('dateRange').value;
    const accNamesSelect = document.getElementById('accNames');
    const selectedAccounts = accNamesSelect.value === 'all'
        ? Array.from(accNamesSelect.options).filter(option => option.value !== 'all').map(option => option.value)
        : [accNamesSelect.value];

    const allAccs = await Promise.all(selectedAccounts.map(aName => load(aName, datetime)));
    window.adAcounts = allAccs.flat();
    const tf = new TableFormatter();
    tf.formatAdAccounts(window.adAcounts);
}

async function load(accName, datetime) {
    try {
        let adAccounts = [];
        let rawAccounts = await Requests.getStats(accName, datetime);
        for (const accIndex in rawAccounts.stats.data) {
            const rawAccount = rawAccounts.data[accIndex];
            adAccounts.push(new AdAccount(rawAccount, accName));
        }
        return adAccounts;
    } catch (error) {
        console.error('An error occured getting accounts:', error);
        return [];
    }
}