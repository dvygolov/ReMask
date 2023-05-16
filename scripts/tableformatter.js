import {account_statuses, disable_reasons, ranking} from "./constants.js";
import {MathHelpers} from "./mathhelpers.js";
import {Actions} from "./actions.js";

export class TableFormatter {
    addTableHeader(parent) {
        let tr = document.createElement('tr');
        const headers = [
            'Creo', 'Name/Link', 'Actions', 'Status/Ranking',
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
            resAds.forEach(ad => statBody.appendChild(this.createAdRow(acc, ad)));
        });
        this.addActions();
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

    createAccountRow(acc) {
        const tr = document.createElement('tr');
        tr.id = acc.id;
        tr.className = 'poster';

        const ascolor = acc.status === 1 || acc.status === 'ACTIVE' ? 'Lime' : 'Red';
        const accountStatusText = `<span style="color:${ascolor}">${account_statuses[acc.status]}</span>`;
        const drcolor = acc.disable_reason === 0 ? 'Lime' : 'Red';
        const disableReasonText = `<span style="color:${drcolor}">${disable_reasons[acc.disable_reason]}</span>`;

        const accountInfo = `${acc.socname}: ${acc.name} - ${acc.spendlimit}/${acc.billing}/${acc.curspend}`;
        const popupInfo = `
            ID: ${acc.id}<br>
            Pixel: ${acc.pixelid}<br> 
            Card: ${acc.paymentinfo}<br/> 
            Total spend: ${acc.totalspend} ${acc.currency}<br/>
            Time zone: ${acc.timezone}<br/>
            Created: ${acc.createdtime}`;
        let actions = this.getAccActions(acc);
        const rowData = `
        <td colspan="2" style="text-align:left;padding-left:15px;">
            <div class="descr">${popupInfo}</div><h5>${accountInfo}</h5>
        </td>
        <td> ${actions} </td>
        <td><b>${accountStatusText}<br/>${disableReasonText}</b></td>
        <td><b>${acc.totalStats.results}</b></td>
        <td><b>${MathHelpers.average(acc.totalStats.CPA)}</b></td>
        <td><b>${acc.totalStats.spend}</b></td>
        <td><b>${acc.totalStats.clicks}</b></td>
        <td><b>${MathHelpers.average(acc.totalStats.CPC)}</b></td>
        <td><b>${MathHelpers.average(acc.totalStats.CTR)}%</b></td>
        <td><b>${acc.totalStats.impressions}</b></td>
        <td><b>${MathHelpers.average(acc.totalStats.CPM)}</b></td>`;

        tr.style = 'box-shadow: rgba(15, 17, 19, 0.63) 0px 0px 20px 2px;';
        tr.innerHTML = rowData;
        return tr;
    }

    createAdRow(acc, ad) {
        const imageCell = this.getImageCell(ad.imageUrl, ad.thumbUrl);
        let link = ad.link;
        if (ad.urlparams) link += ad.urlparams;
        const name = ad.link ? `<a href='${link}' target='_blank'>${ad.name}</a>` : ad.name;
        const esColor = this.getAdStatusColor(ad.status);
        const rank = `<span title="Engagement">${ranking[ad.engagementScore]}</span>|<span title="Conversion">${ranking[ad.conversionScore]}</span>|<span title="Quality">${ranking[ad.qualityScore]}</span>`;
        let status = ad.status;
        if (ad.reviewFeedback) status += `<br/>${ad.reviewFeedback}`;
        if (ad.qualityScore && ad.qualityScore !== "UNKNOWN") status += `<br/>${rank}`;
        const tdArray = [
            imageCell,
            `<nobr>${name}</nobr>`,
            `${this.getAdActions(acc, ad)}`,
            `<p style="color:${esColor};">${status}</p>`,
            `<nobr>${ad.results}</nobr>`,
            `<nobr>${ad.CPA}</nobr>`,
            `<nobr>${ad.spend}</nobr>`,
            `<nobr>${ad.clicks}</nobr>`,
            `<nobr>${ad.CPC}</nobr>`,
            `<nobr>${ad.CTR}%</nobr>`,
            `<nobr>${ad.impressions}</nobr>`,
            `<nobr>${ad.CPM}</nobr>`
        ];
        const tr = document.createElement('tr');
        for (const tdContent of tdArray) {
            const td = document.createElement('td');
            td.innerHTML = tdContent;
            tr.appendChild(td);
        }
        return tr;
    }


    getAccActions(acc) {
        let actions = "";
        if (acc.status == 2 && acc.disable_reason == 1) // DISABLED ADS_INTEGRITY_POLICY
            actions += `<i class="fas fa-paper-plane sendappeal" title="Send appeal" data-socname="${acc.socname}" data-accid="${acc.id}"></i> `;
        else if (acc.status == 3 && acc.paymentinfo) //UNSETTLED + has card
            actions += `<i class="fas fa-money-bill payunsettled" title="Pay UNSETTLED" data-socname="${acc.socname}" data-accid="${acc.id}" data-paymentid="${acc.paymentid}" data-currecy="${acc.currency}"></i> `;
        if (acc.rules.length > 0) {
            actions += `<span title="${acc.rules.map(rule => rule.name).join('\n')}">${acc.rules.length}</span> <i class="fas fa-download downrules" title="Download autorules" data-socname="${acc.socname}" data-accid="${acc.id}"></i> `;
            actions += `<i class="fas fa-trash-can delrules" title="Delete autorules" data-socname="${acc.socname}" data-accid="${acc.id}"></i> `;
        }
        if (acc.status != 2)
            actions += `<i class="fas fa-upload uprules" title="Upload autorules" data-socname="${acc.socname}" data-accid="${acc.id}"></i> `;
        return actions;
    }

    getAdActions(acc, ad) {
        if (acc.status == 2) return ''; //When acc DISABLED = no actions for ads
        switch (ad.status) {
            case 'DISAPPROVED':
                return `<i class="fas fa-paper-plane senddisapprove" title="Send appeal" data-socname="${acc.socname}" data-adid="${ad.id}"></i>`;
                break;
            case 'PAUSED':
                return `<i class="fas fa-play startad" title="Start ad" data-socname="${acc.socname}" data-adid="${ad.id}"></i>`;
                break;
            case 'ACTIVE':
                return `<i class="fas fa-stop stopad" title="Stop ad" data-socname="${acc.socname}" data-adid="${ad.id}"></i>`;
                break;
            default:
                return '';
        }
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

    addActions() {
        const downloadRulesButtons = document.querySelectorAll('.downrules');
        downloadRulesButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const accId = event.target.dataset.accid;
                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                Actions.downloadRules(accId);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const uploadRulesButtons = document.querySelectorAll('.uprules');
        uploadRulesButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const accId = event.target.dataset.accid;
                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.uploadRules(socname, accId);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const delRulesButtons = document.querySelectorAll('.delrules');
        delRulesButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const accId = event.target.dataset.accid;
                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.deleteRules(socname, accId);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const payButtons = document.querySelectorAll('.payunsettled');
        payButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const accId = event.target.dataset.accid;
                const paymentId = event.target.dataset.accid;
                const currency = event.target.dataset.currency;
                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.payUnsettled(socname, accId, paymentId, currency);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const appealButton = document.querySelectorAll('.sendappeal');
        appealButton.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const accId = event.target.dataset.accid;

                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.sendAccAppeal(socname, accId);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const startButton = document.querySelectorAll('.startad');
        startButton.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const adId = event.target.dataset.adid;

                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.startAd(socname, adId);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const stopButton = document.querySelectorAll('.stopad');
        stopButton.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const adId = event.target.dataset.adid;
                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.stopAd(socname, adId)
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });

        const disapproveButton = document.querySelectorAll('.senddisapprove');
        disapproveButton.forEach(button => {
            button.addEventListener('click', async (event) => {
                const socname = event.target.dataset.socname;
                const adId = event.target.dataset.adid;

                const originalClassNames = event.target.className;
                event.target.className = ' fas fa-spinner fa-spin';
                event.target.disabled = true;
                await Actions.sendAdAppeal(socname, adId);
                event.target.className = originalClassNames;
                event.target.disabled = false;
            });
        });
    }
}
