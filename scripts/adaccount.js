import {Ad} from "./ad.js";
import {MathHelpers} from "./mathhelpers.js";

export class AdAccount {
    constructor(accountData, accName) {
        this.id = accountData.id.replace(/^act_/, '');
        this.socname = accName;
        this.name = accountData.name;
        this.pixelid = accountData.adspixels?.data[0]?.id ?? "";
        this.spendlimit = accountData.adtrust_dsl;
        this.billing = MathHelpers.mathMoney(accountData.adspaymentcycle?.data?.[0]?.threshold_amount ?? 0);
        this.curspend = accountData.current_unbilled_spend?.amount ?? 0;
        this.totalspend = MathHelpers.mathMoney(accountData.amount_spent ?? 0);
        this.cardinfo = accountData.funding_source_details?.display_string ?? "";
        this.currency = accountData.currency;
        this.timezone = accountData.timezone_name;
        this.status = accountData.account_status;
        this.disable_reason = accountData.disable_reason;
        this.adspaymentcycle = accountData.adspaymentcycle;
        this.funding_source_details = accountData.funding_source_details;
        this.adspixels = accountData.adspixels;
        this.insights = accountData.insights;
        this.ads = accountData.ads ? accountData.ads.data.map(adData => new Ad(adData)) : [];
        this.createdtime = accountData.created_time;
        this.rules = accountData.adrules_library?.data ?? [];

        this.totalStats = {
            results: 0,
            CPA: [],
            spend: 0,
            clicks: 0,
            CPC: [],
            CTR: [],
            impressions: 0,
            CPM: []
        };
        this.ads.forEach((ad) => {
            this.totalStats.results += ad.results;
            this.totalStats.CPA.push(ad.CPA);
            this.totalStats.spend += ad.spend;
            this.totalStats.clicks += ad.clicks;
            this.totalStats.CPC.push(ad.CPC);
            this.totalStats.CTR.push(ad.CTR);
            this.totalStats.impressions += ad.impressions;
            this.totalStats.CPM.push(ad.CPM);
        });
    }

    isActive() {
        return this.status != 2;
    }
}
