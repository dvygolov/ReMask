import {Ad} from "./ad.js";

export class AdAccount {
    constructor(accountData, accName) {
        this.id = accountData.id.replace('/act_/','');
        this.name = `${accName}: ${accountData.name}`;
        this.pixelid = accountData.adspixels?.data[0]?.id ?? "";
        this.spendlimit = accountData.adtrust_dsl;
        this.billing = accountData.adspaymentcycle?.data?.[0]?.threshold_amount ?? 0;
        this.curspend = accountData.current_unbilled_spend?.amount ?? 0;
        this.totalspend = 0;
        this.cardinfo = accountData.funding_source_details?.display_string ?? "";
        this.currency = accountData.currency;
        this.timezone = accountData.timezone_name;
        this.status = accountData.account_status;
        this.disable_reason = accountData.disable_reason;
        this.adspaymentcycle = accountData.adspaymentcycle;
        this.current_unbilled_spend = accountData.current_unbilled_spend;
        this.funding_source_details = accountData.funding_source_details;
        this.adspixels = accountData.adspixels;
        this.insights = accountData.insights;
        this.ads = accountData.ads ? accountData.ads.data.map(adData => new Ad(adData)) : [];
        this.created_time = accountData.created_time;
        this.rules = accountData.adrules_library?.data??[];
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

    isActive() {
        return this.status != 2;
    }
}
