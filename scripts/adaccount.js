import {MathHelpers} from "./mathhelpers.js";
import {Ad} from "./ad.js";

export class AdAccount {
    constructor(accountData, accName) {
        const bill = adspaymentcycle?.data?.[0]?.threshold_amount;
        const billing = bill ? '/' + MathHelpers.mathMoney(parseFloat(bill)).toString() : '';
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
