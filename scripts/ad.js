import {MathHelpers} from "./mathhelpers.js";

export class Ad {
    constructor(adData, insightsData) {
        this.id = adData.id;
        this.name = adData.name;
        this.status = adData.effective_status;
        this.reviewFeedback = adData.ad_review_feedback?.global ? Object.keys(adData.ad_review_feedback.global).join('<br>') : '';
        this.impressions = adData.impressions ?? 0;
        this.clicks = parseInt(adData.insights.data[0].inline_link_clicks ?? 0);
        this.results = parseInt(insightsData[this.id] !== undefined ? insightsData[this.id].results : 0);
        this.spend = MathHelpers.mathMoney(adData.spent ?? 0);
        this.CPA = MathHelpers.mathStat(insightsData[this.id] !== undefined ? insightsData[this.id].cost_per_result: 0);
        this.CTR = MathHelpers.mathStat(adData.insights.data[0].inline_link_click_ctr ?? 0);
        this.CPM = MathHelpers.mathStat(adData.insights.data[0].cpm ?? 0);
        this.CPC = MathHelpers.mathStat(adData.insights.data[0].cpc ?? 0);
        this.adcreative = adData.adcreatives.data[0];
        this.imageUrl = this.adcreative.image_url ?? '';
        this.thumbUrl = this.adcreative.thumbnail_url ?? '';
        this.link = this.adcreative.object_story_spec?.link_data?.link ?? '';
        this.urlparams = this.adcreative.url_tags ?? '';
        this.qualityScore = adData.insights.data[0].quality_ranking ?? "UNKNOWN";
        this.engagementScore = adData.insights.data[0].engagement_rate_ranking ?? "UNKNOWN";
        this.conversionScore =adData.insights.data[0].conversion_rate_ranking ?? "UNKNOWN";
    }

    isActive() {
        return ['ACTIVE', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED', 'PENDING_REVIEW'].includes(this.status);
    }
}
