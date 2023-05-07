import {account_statuses, disable_reasons} from "./constants.js";
import {Actions} from "./actions.js";

export class TableFormatter {
    addTableHeader(parent) {
        let tr = document.createElement('tr');
        const headers = [
            'Creo', 'Name/Link', 'Actions', 'Status/Reason',
            'Results', 'CPA', 'Spend', 'Clicks', 'CPC', 'CTR',
            'Impres.', 'CPM'
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
        if (!showAll) allAccs = allAccs.filter(acc => acc.isActive());
        this.addTableHeader(statBody);
        allAccs.forEach(acc => {
            statBody.appendChild(this.createAccountRow(acc, showAll));
            let resAds = acc.ads;
            if (!showAll) resAds = resAds.filter(ad => ad.isActive());
            resAds.forEach(ad => statBody.appendChild(this.createAdRow(ad)));
        });
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
        const imageCell = this.getImageCell(ad.imageUrl, ad.thumbUrl);
        let link = ad.link;
        if (ad.urlparams) link +=ad.urlparams;
        const name = ad.link ? `<a href='${link}' target='_blank'>${ad.name}</a>` : ad.name;
        const esColor = this.getAdStatusColor(ad.status);
        const tdArray = [
            imageCell,
            `<nobr>${name}</nobr>`,
            `${this.getAdActions(ad)}`,
            `<p style="color:${esColor};">${ad.status}<br/> ${ad.reviewFeedback}</p>`,
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

        const ascolor = acc.status === 1 || acc.status === 'ACTIVE' ? 'Lime' : 'Red';
        const accountStatusText = `<span style="color:${ascolor}">${account_statuses[acc.status]}</span>`;
        const drcolor = acc.disable_reason === 0 ? 'Lime' : 'Red';
        const disableReasonText = `<span style="color:${drcolor}">${disable_reasons[acc.disable_reason]}</span>`;

        const accountInfo = `${acc.name} - ${acc.spendlimit}/${acc.billing}/${acc.curspend}`;
        const popupInfo = `
            ID: ${acc.id}<br>
            Pixel: ${acc.pixelid}<br> 
            Card: ${acc.cardinfo}<br/> 
            Currency: ${acc.currency}<br/> 
            Total spend: ${acc.totalspend}<br/>
            Time zone: ${acc.timezone}<br/>
            Created: ${acc.createdtime}`;
        let actions = this.getAccActions(acc);
        const rowData = `
        <td colspan="2" style="text-align:left;padding-left:15px;">
            <div class="descr">${popupInfo}</div><h5>${accountInfo}</h5>
        </td>
        <td> ${actions} </td>
        <td><b>${accountStatusText}<br/>${disableReasonText}</b></td>
        <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>`;

        tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
        tr.innerHTML = rowData;
        return tr;
    }

    getAdActions(ad) {
        switch (ad.status) {
            case 'DISAPPROVED':
                return `<i class="fas fa-paper-plane" title="Send appeal" onclick="Actions.sendAdAppeal(${ad.id});"></i>`;
                break;
            case 'PAUSED':
                return `<i class="fas fa-play" title="Start ad" onclick="Actions.startAd(${ad.id});"></i>`;
                break;
            case 'ACTIVE':
                return `<i class="fas fa-stop" title="Stop ad" onclick="Actions.stopAd(${ad.id});"></i>`;
                break;
            default:
                return '';
        }
    }

    getAccActions(acc) {
        let actions = "";
        if (acc.status == 2 && acc.disable_reason == 1) // DISABLED ADS_INTEGRITY_POLICY
            actions += `<i class="fas fa-paper-plane" title="Send appeal" onclick="Actions.sendAccAppeal(${acc.id});"></i> `;
        else if (acc.status == 3) //UNSETTLED
            actions += `<i class="fas fa-money-bill" title="Pay UNSETTLED" onclick="Actions.payUnsettled(${acc.id});"></i> `;
        if (acc.rules.length > 0)
            actions += `${acc.rules.length} <i class="fas fa-download" title="Download autorules" onclick="Actions.downloadRules(${acc.id});"></i> `;
        if (acc.status != 2)
            actions += `<i class="fas fa-upload" title="Upload autorules" onclick="Actions.uploadRules(${acc.id});"></i> `;
        return actions;
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
