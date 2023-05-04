const disable_reasons = [
    '',
    'ADS_INTEGRITY_POLICY',
    'ADS_IP_REVIEW',
    'RISK_PAYMENT',
    'GRAY_ACCOUNT_SHUT_DOWN',
    'ADS_AFC_REVIEW',
    'BUSINESS_INTEGRITY_RAR',
    'PERMANENT_CLOSE',
    'UNUSED_RESELLER_ACCOUNTR'
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


async function load_data() {
    clearTable();
    await loadAllStatistics();
}

async function loadAllStatistics() {
    let parent = document.getElementById('statBody');
    addTableHeader(parent);

    let showAll = document.getElementById('showParam').value === "all"; //active or all
    let datetime = document.getElementById('dateRange').value;

    const accNamesSelect = document.getElementById('accNames');
    const selectedAccounts = accNamesSelect.value === 'all'
        ? Array.from(accNamesSelect.options).filter(option => option.value !== 'all').map(option => option.value)
        : [accNamesSelect.value];

    const allAccsTrs = await Promise.all(selectedAccounts.map(aName => load(aName, datetime, showAll)));
    allAccsTrs.forEach(accTrs => accTrs.forEach(accTr => parent.appendChild(accTr)));
}


// Example usage
async function load(accName, datetime, showAll) {
    let trs = [];
    let accounts = await fetchData(accName, datetime);
    for (const accIndex in accounts.data) {
        const adAccount = accounts.data[accIndex];
        const accountRow = createAccountRow(accName, adAccount, showAll);
        trs.push(accountRow);
        const totalStats = {
            tImpressions: 0,
            tClicks: 0,
            tResult: 0,
            tSpent: 0,
            tCPL: [],
            tCPM: [],
            tCTR: [],
            tCPC: [],
        };

        if (!adAccount.ads) continue;

        for (const adIndex in adAccount.ads.data) {
            const ad = adAccount.ads.data[adIndex];
            let tr = processAd(ad, totalStats, showAll, adAccount['account_status'], adAccount['disable_reason']);
            trs.push(tr);
        }
        updateTotalRow(accountRow, totalStats);
    }
    return trs;
}

function createAccountRow(accName, accountData, showAll) {
    const {
        name: username,
        account_status,
        disable_reason,
        adtrust_dsl,
        currency,
        id,
        ads,
        adspaymentcycle,
        current_unbilled_spend,
        funding_source_details,
        adspixels,
        insights,
    } = accountData;

    const bill = adspaymentcycle?.data?.[0]?.threshold_amount;
    const billing = bill ? '/' + mathMoney(parseFloat(bill)).toString() : '';
    const currunbilled = current_unbilled_spend?.amount ? '/' + current_unbilled_spend.amount : '';
    const card = funding_source_details?.display_string
        ? ' (' + funding_source_details.display_string + ' ' + currency + ')'
        : '';

    const ascolor = account_status === 1 || account_status === 'ACTIVE' ? 'Lime' : 'Red';
    const dscolor = disable_reason === 0 ? 'Lime' : 'Red';

    const pixelid = adspixels?.data?.[0]?.id ?? '';

    const rkid = insights?.data?.[0]?.account_id ?? '';
    const rkstart = insights?.data?.[0]?.date_start ?? '';
    const rkstop = insights?.data?.[0]?.date_stop ?? '';
    const rkspent = insights?.data?.[0]?.spend ?? '';

    const tr = document.createElement('tr');
    tr.id = id;
    tr.className = 'poster';

    const accountStatusText = `<span style="color:${ascolor}">${account_statuses[account_status]}</span>`;
    const disableReasonText = `<span style="color:${dscolor}">${disable_reasons[disable_reason]}</span>`;
    const accountInfo = `${accName}: ${username} - ${adtrust_dsl}${billing}${currunbilled}${card}`;
    const insightsInfo = `Start: ${rkstart} | Stop: ${rkstop}<br>Spent: ${rkspent}<br>ID: ${rkid}<br>Pixel: ${pixelid}<br>`;
    const rowData = `<td colspan="2" style="text-align:left;padding-left:15px;"><div class="descr">${insightsInfo}</div><h5>${accountInfo}</h5></td><td><b>${accountStatusText}<br/>${disableReasonText}</b></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

    if (!showAll) {
        if (account_status === 1 && disable_reason === 0) {
            tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
            tr.innerHTML = rowData;
        }
    } else {
        tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
        tr.innerHTML = rowData;
    }

    return tr;
}

function processAd(ad, totalStats, showAll, account_status, disable_reason) {
    const accStatus = account_statuses[account_status];
    const disReason = disable_reasons[disable_reason];
    const effectiveStatus = ad.effective_status;
    const adCreative = ad.adcreatives.data[0];

    const fullImageUrl = adCreative.image_url || '';
    const thumbnailUrl = adCreative.thumbnail_url || '';

    const imageCell = getImageCell(fullImageUrl, thumbnailUrl);

    const link = adCreative.object_story_spec?.link_data?.link || '';
    const name = link ? `<a href='${link}' target='_blank'>${ad.name}</a>` : ad.name;

    let adStats = getStats(ad);
    updateTotalStats(adStats, totalStats);

    const esColor = getStatusColor(effectiveStatus);
    const reviewFeedback = getReviewFeedback(ad.ad_review_feedback);

    return createTableRowContent(showAll, accStatus, disReason, effectiveStatus, name, esColor, adStats, imageCell, reviewFeedback);
}

function getStats(ad) {
    const impressions = ad.impressions || 0;
    const clicks = ad.insights.data[0].inline_link_clicks || 0;
    const results = ad.result || 0;
    const adspent = mathMoney(ad.spent) || 0;
    const cpl = ad.cost_per_lead_fb ? mathMoney(ad.cost_per_lead_fb) : 0;
    const ctr = ad.insights.data[0].inline_link_click_ctr ? mathStat(ad.insights.data[0].inline_link_click_ctr) : 0;
    const cpm = ad.insights.data[0].cpm ? mathStat(ad.insights.data[0].cpm) : 0;
    const cpc = ad.insights.data[0].cpc ? mathStat(ad.insights.data[0].cpc) : 0;
    return {impressions, clicks, results, adspent, cpl, ctr, cpm, cpc};
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

    for (let idx = 2; idx < tds.length; idx++) {
        let tdValue = idx === 3 || idx === 4 ?
            parseFloat(totals[idx - 2]).toFixed(2) :
            totals[idx - 2];
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

function getStatusColor(effectiveStatus) {
    switch (effectiveStatus) {
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

const getReviewFeedback = (adReviewFeedback) => adReviewFeedback?.global ? Object.keys(adReviewFeedback.global).join('<br>') : '';

function createTableRowContent(showAll, accStatus, disReason, effectiveStatus, name, esColor, stats, imageCell, reviewFeedback) {
    if (!showAll) {
        if (accStatus === 'ACTIVE' && !disReason && ['ACTIVE', 'CAMPAIGN_PAUSED', 'PENDING_REVIEW'].includes(effectiveStatus))
            return createStatsRowContent(name, esColor, effectiveStatus, stats, imageCell, reviewFeedback);
    } else {
        return createStatsRowContent(name, esColor, effectiveStatus, stats, imageCell, reviewFeedback);
    }
}

function createStatsRowContent(name, esColor, effectiveStatus, stats, imageCell, reviewFeedback) {
    const {impressions, clicks, results, adspent, cpl, cpm, ctr, cpc} = stats;

    const tdArray = [
        imageCell,
        `<nobr>${name}</nobr>`,
        `<p style="color:${esColor};">${effectiveStatus}<br/> ${reviewFeedback}</p>`,
        `<nobr>${impressions}</nobr>`,
        `<nobr>${clicks}</nobr>`,
        `<nobr>${results}</nobr>`,
        `<nobr>${adspent}</nobr>`,
        `<nobr>${cpl}</nobr>`,
        `<nobr>${cpm}</nobr>`,
        `<nobr>${ctr}</nobr>`,
        `<nobr>${cpc}</nobr>`
    ];

    const tr = document.createElement('tr');
    for (const tdContent of tdArray) {
        const td = document.createElement('td');
        td.innerHTML = tdContent;
        tr.appendChild(td);
    }

    return tr;
}

async function fetchData(accName, datetime) {
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

function average(arr) {
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

function mathMoney(num) {
    if (typeof num !== undefined && num !== null && num !== 0) {
        num = parseFloat(num).toFixed(2) / 100;
    } else num = 0;
    return num;
}

function mathStat(num) {
    if (typeof num !== undefined && num !== null && num !== 0) {
        num = parseFloat(num).toFixed(2);
    } else num = 0;
    return num;
}

function addTableHeader(parent) {
    let tr = document.createElement('tr');
    const headers = [
        'Creo', 'Name/Link', 'Status/Reason',
        'Impres.', 'Clicks', 'Results',
        'Spend', 'CPL', 'CPM', 'CTR', 'CPC'
    ];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        tr.appendChild(th);
    });
    parent.appendChild(tr);
}

function clearTable() {
    let statBody = document.getElementById("statBody");
    statBody.innerHTML = '';
}
