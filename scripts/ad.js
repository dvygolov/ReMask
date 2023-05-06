export class Ad {
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
