class AdAccount {
    constructor(accountData, accName) {
        const bill = adspaymentcycle?.data?.[0]?.threshold_amount;
        const billing = bill ? '/' + mathMoney(parseFloat(bill)).toString() : '';
        const currunbilled = current_unbilled_spend?.amount ? '/' + current_unbilled_spend.amount : '';
        const card = funding_source_details?.display_string ? funding_source_details.display_string + ' (' + currency + ')' : '';
        this.id = accountData.id;
        this.name = `${accName}: ${accountData.name}`;
        this.pixelid = accountData.adspixels?.data[0]?.id ?? "";
        this.spendlimit = accountData.adtrust_dsl;
        this.billing = 0;
        this.curspend = 0;
        this.totalspend = 0;
        this.cardinfo = "";
        this.currency = accountData.currency;
        this.timezone = accountData.timezone_name;
        this.account_status = accountData.account_status;
        this.disable_reason = accountData.disable_reason;
        this.adspaymentcycle = accountData.adspaymentcycle;
        this.current_unbilled_spend = accountData.current_unbilled_spend;
        this.funding_source_details = accountData.funding_source_details;
        this.adspixels = accountData.adspixels;
        this.insights = accountData.insights;
        this.ads = accountData.ads ? accountData.ads.data.map(adData => new Ad(adData)) : [];
        this.created_time = accountData.created_time;
        this.totalStats = {
            tImpressions: 0,
            tClicks: 0,
            tResult: 0,
            tSpent: 0,
            tCPL: [],
            tCPM: [],
            tCTR: [],
            tCPC: []
        };
    }
    isActive(){

    }
}

class Ad {
    constructor(adData) {
        this.name = adData.name;
        this.effectiveStatus = adData.effective_status;
        this.reviewFeedback = adData.ad_review_feedback?.global ? Object.keys(adData.ad_review_feedback.global).join('<br>') : '';
        this.impressions = adData.impressions || 0;
        this.clicks = adData.insights.data[0].inline_link_clicks || 0;
        this.results = adData.result || 0;
        this.adspent = mathMoney(adData.spent) || 0;
        this.cpl = adData.cost_per_lead_fb ? mathMoney(adData.cost_per_lead_fb) : 0;
        this.ctr = adData.insights.data[0].inline_link_click_ctr ? mathStat(adData.insights.data[0].inline_link_click_ctr) : 0;
        this.cpm = adData.insights.data[0].cpm ? mathStat(adData.insights.data[0].cpm) : 0;
        this.cpc = adData.insights.data[0].cpc ? mathStat(adData.insights.data[0].cpc) : 0;
        this.adcreative = adData.adcreatives.data[0];
        this.imageUrl = this.adcreative.image_url || this.adcreative.thumbnail_url || '';
        this.link = this.adcreative.object_story_spec?.link_data?.link || '';
    }

    isActive() {
        return ['ACTIVE', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED', 'PENDING_REVIEW'].includes(this.effectiveStatus);
    }
}

const disable_reasons = [
    '',
    'ADS_INTEGRITY_POLICY',
    'ADS_IP_REVIEW',
    'RISK_PAYMENT',
    'GRAY_ACCOUNT_SHUT_DOWN',
    'ADS_AFC_REVIEW',
    'BUSINESS_INTEGRITY_RAR',
    'PERMANENT_CLOSE',
    'UNUSED_RESELLER_ACCOUNT'
];

const account_statuses = {
    1: 'ACTIVE',
    2: 'DISABLED',
    3: 'UNSETTLED',
    7: 'PENDING_RISK_REVIEW',
    8: 'PENDING_SETTLEMENT',
    9: 'IN_GRACE_PERIOD',
    100: 'PENDING_CLOSURE',
    101: 'CLOSED',
    201: 'ANY_ACTIVE',
    202: 'ANY_CLOSED'
};


async function loadAllStatistics() {
    let datetime = document.getElementById('dateRange').value;
    const accNamesSelect = document.getElementById('accNames');
    const selectedAccounts = accNamesSelect.value === 'all'
        ? Array.from(accNamesSelect.options).filter(option => option.value !== 'all').map(option => option.value)
        : [accNamesSelect.value];

    const allAccs = await Promise.all(selectedAccounts.map(aName => load(aName, datetime)));
    const tf = new TableFormatter();
    tf.formatAdAccounts(allAccs);
}

async function load(accName, datetime) {
    let adAccounts = [];
    let rawAccounts = await new Requests().fetchData(accName, datetime);
    for (const accIndex in rawAccounts.data) {
        const rawAccount = rawAccounts.data[accIndex];
        adAccounts.push(new AdAccount(rawAccount, accName));
    }
    return adAccounts;
}


function updateTotalStats(adStats, totalStats) {
    const {impressions, clicks, results, adspent, cpl, ctr, cpm, cpc} = adStats;

    totalStats.tImpressions += parseInt(impressions);
    totalStats.tClicks += parseInt(clicks);
    totalStats.tResult += parseInt(results);
    totalStats.tSpent += parseFloat(adspent);

    if (cpl) totalStats.tCPL.push(cpl);
    if (cpm) totalStats.tCPM.push(cpm);
    if (ctr) totalStats.tCTR.push(ctr);
    if (cpc) totalStats.tCPC.push(cpc);
}

function updateTotalRow(accountRow, stats) {
    const tds = accountRow.getElementsByTagName("td");
    const totals = [
        stats.tImpressions,
        stats.tClicks,
        stats.tResult,
        parseFloat(stats.tSpent).toFixed(2),
        average(stats.tCPL),
        average(stats.tCPM),
        average(stats.tCTR),
        average(stats.tCPC),
    ];

    for (let idx = 3; idx < tds.length; idx++) {
        let tdValue = idx === 3 || idx === 4 ?
            parseFloat(totals[idx - 3]).toFixed(2) :
            totals[idx - 3];
        tds[idx].innerHTML = `<b>${tdValue}</b>`
    }
}

function getImageCell(fullImageUrl, thumbnailUrl) {
    if (fullImageUrl) {
        return `<td><a href='${fullImageUrl}' target='_blank'><img src='${thumbnailUrl}' width='50' height='50'></a></td>`;
    } else if (thumbnailUrl) {
        return `<td><img src='${thumbnailUrl}' width='50' height='50'></td>`;
    } else {
        return "<td><h6 style='color: red;'>Thumbnail unavailable,<br/>ad deleted</h6></td>";
    }
}


function createTableRowContent(showAll, accStatus, disReason, effectiveStatus, name, esColor, stats, imageCell, reviewFeedback) {
    if (!showAll) {
        return createStatsRowContent(name, esColor, effectiveStatus, stats, imageCell, reviewFeedback);
    } else {
        return createStatsRowContent(name, esColor, effectiveStatus, stats, imageCell, reviewFeedback);
    }
}

function createStatsRowContent(name, esColor, effectiveStatus, stats, imageCell, reviewFeedback) {
    const {impressions, clicks, results, adspent, cpl, cpm, ctr, cpc} = stats;

}

class NumbersFormat {
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

class TableFormatter {
    addTableHeader(parent) {
        let tr = document.createElement('tr');
        const headers = [
            'Creo', 'Name/Link', 'Actions', 'Status/Reason',
            'Impres.', 'Clicks', 'Results', 'Spend',
            'CPL', 'CPM', 'CTR', 'CPC'
        ];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            tr.appendChild(th);
        });
        parent.appendChild(tr);
    }

    formatAdAccounts(allAccs) {
        let statBody = document.getElementById('statBody');
        statBody.innerHTML = '';
        let showAll = document.getElementById('showParam').value === 'all'; //active or all
        this.addTableHeader(statBody);
        allAccs.forEach(accPack => accPack.forEach(acc => statBody.appendChild(this.createAccountRow(acc, showAll))));
    }

    getAdStatusColor(status) {
        switch (status) {
            case 'ACTIVE':
                return 'Lime';
            case 'ADSET_PAUSED':
            case 'CAMPAIGN_PAUSED':
            case 'PENDING_REVIEW':
                return 'Gold';
            default:
                return 'Red';
        }
    }

    createAdRow(ad) {
        const imageCell = getImageCell(fullImageUrl, thumbnailUrl);
        const name = ad.link ? `<a href='${ad.link}' target='_blank'>${ad.name}</a>` : ad.name;
        const esColor = this.getAdStatusColor(ad.effective_status);
        const tdArray = [
            imageCell,
            `<nobr>${name}</nobr>`,
            `Button`,
            `<p style="color:${esColor};">${effectiveStatus}<br/> ${reviewFeedback}</p>`,
            `<nobr>${ad.impressions}</nobr>`,
            `<nobr>${ad.clicks}</nobr>`,
            `<nobr>${ad.results}</nobr>`,
            `<nobr>${ad.adspent}</nobr>`,
            `<nobr>${ad.cpl}</nobr>`,
            `<nobr>${ad.cpm}</nobr>`,
            `<nobr>${ad.ctr}</nobr>`,
            `<nobr>${ad.cpc}</nobr>`
        ];
        const tr = document.createElement('tr');
        for (const tdContent of tdArray) {
            const td = document.createElement('td');
            td.innerHTML = tdContent;
            tr.appendChild(td);
        }
        return tr;
    }

    createAccountRow(acc) {
        const tr = document.createElement('tr');
        tr.id = acc.id;
        tr.className = 'poster';

        const ascolor = acc.account_status === 1 || acc.account_status === 'ACTIVE' ? 'Lime' : 'Red';
        const accountStatusText = `<span style="color:${ascolor}">${account_statuses[acc.account_status]}</span>`;
        const drcolor = acc.disable_reason === 0 ? 'Lime' : 'Red';
        const disableReasonText = `<span style="color:${drcolor}">${disable_reasons[acc.disable_reason]}</span>`;

        const accountInfo = `${acc.name} - ${acc.adtrust_dsl}${acc.billing}${acc.currunbilled}`;
        const popupInfo = `ID: ${acc.id}<br>Pixel: ${acc.pixelid}<br> Card: ${card}`;
        const rowData = `
        <td colspan="2" style="text-align:left;padding-left:15px;">
            <div class="descr">${popupInfo}</div><h5>${accountInfo}</h5>
        </td>
        <td>
            <i class="fas fa-money-bill" title="Pay UNSETTLED"></i>
            <i class="fas fa-play" title="Start ad"></i> <i class="fas fa-stop" title="Stop ad"></i>
            <i class="fas fa-upload" title="Upload autorules"></i> <i class="fas fa-download" title="Download autorules"></i>
            <i class="fas fa-paper-plane" title="Send appeal"></i>
        </td>
        <td><b>${accountStatusText}<br/>${disableReasonText}</b></td>
        <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

        tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
        tr.innerHTML = rowData;
        return tr;
    }
}

class Requests {
    async fetchData(accName, datetime) {
        let url = `/ajax/getAccountStatistics.php?acc_name=${accName}&datetime=${datetime}`;
        try {
            let response = await fetch(url);
            let json = await response.json();
            if (response.status === 200 & !json.error) return json;
            if (typeof json.error === 'object')
                json.error = JSON.stringify(json.error);
            alert(`Error getting statistics for account:${accName}\n${json.error}`);
        } catch (error) {
            alert(`Error fetching data for account:${accName}\n${error}`);
        }
    }
}
