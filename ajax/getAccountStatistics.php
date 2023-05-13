<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

$serializer = new FbAccountSerializer(FILENAME);
$acc = $serializer->getAccountByName($_GET['acc_name']);
if ($acc == null) die("No account with name " . $_GET['acc_name'] . " found!");
$datetime = $_GET['datetime'];
$requestParams = "fields=
name,
status,
account_status,
disable_reason,
adspixels{id},
promote_pages{access_token,id},
business{name,link},
all_payment_methods{pm_credit_card{account_id,credential_id,display_string,exp_month,exp_year}},
funding_source_details,
adrules_library{id,name,evaluation_spec,execution_spec,schedule_spec},
spend_cap,
current_unbilled_spend,
balance,
amount_spent,
adtrust_dsl,
adspaymentcycle,
currency,
timezone_name,
created_time,
ads.date_preset($datetime).time_increment($datetime).limit(500){
    id,
    name,
    impressions,
    clicks,
    link_ctr,
    spent,
    insights.limit(500).date_preset($datetime){
        conversion_rate_ranking, 
        engagement_rate_ranking, 
        quality_ranking,
        results{values{value}},
        inline_link_click_ctr,
        inline_link_clicks,
        ctr,
        cpc,
        cpm
    },
    creative{
        effective_object_story_id,
        effective_instagram_story_id,
        actor_id
    },
    adlabels,
    created_time,
    recommendations,
    updated_time,
    ad_review_feedback,
    bid_info,
    delivery_info,
    status,
    effective_status,
    adcreatives.limit(500){
        place_page_set_id,
        object_story_spec{
            instagram_actor_id,
            link_data{link},
            page_id
        },
        url_tags,
        image_crops,
        image_url,
        status,
        thumbnail_url
    }
}";

$requestParams = preg_replace('/\s+/', '', $requestParams);
$req = new FbRequests();
$resp = $req->Get($acc, "me/adaccounts?$requestParams");
$stats = json_decode($resp['res'], true);

$batch = [];
foreach ($stats['data'] as $adAcc) {
    $batchItem = [
        'name' => $adAcc['id'],
        'method' => 'GET',
        'relative_url' =>
            $adAcc['id'] . "/ads?fields=id,insights.limit(500).date_preset($datetime){results,cost_per_result}"
    ];
    $batch[] = $batchItem;
}

$batchJson = urlencode(json_encode($batch));

$req = new FbRequests();
$resp = $req->Post($acc, "", "batch=$batchJson&include_headers=false");
$results = json_decode($resp['res'], true);

$adResults = [];
foreach ($results as $adAccResult) {
    $jsonAdAccResult = json_decode($adAccResult['body'], true);
    foreach ($jsonAdAccResult['data'] as $adResult) {
        $results = $adResult['insights']['data'][0]['results'][0];
        $costs = $adResult['insights']['data'][0]['cost_per_result'][0];
        $adResults[$adResult['id']] = [
            'results' => isset($results['values'])?$results['values'][0]['value'] : 0,
           'cost_per_result' => isset($costs['values'])?$costs['values'][0]['value'] : 0
       ];
    }
}

$finalRes = [];
$finalRes['stats'] = $stats;
$finalRes['insights'] = $adResults;
$resp['res'] = json_encode($finalRes);
ResponseFormatter::Respond($resp);