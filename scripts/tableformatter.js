export class TableFormatter {
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

    getImageCell(fullImageUrl, thumbnailUrl) {
        if (fullImageUrl) {
            return `<td><a href='${fullImageUrl}' target='_blank'><img src='${thumbnailUrl}' width='50' height='50'></a></td>`;
        } else if (thumbnailUrl) {
            return `<td><img src='${thumbnailUrl}' width='50' height='50'></td>`;
        } else {
            return "<td><h6 style='color: red;'>Thumbnail unavailable,<br/>ad deleted</h6></td>";
        }
    }
}
