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
$requestParams = "fields=adspixels,promote_pages{access_token,id},insights.date_preset($datetime),ads.date_preset($datetime).time_increment($datetime).limit(500){insights.limit(500).date_preset($datetime){results,inline_link_click_ctr,inline_link_clicks,ctr,cpc,cpm},creative{effective_object_story_id,effective_instagram_story_id,actor_id},adlabels,created_time,recommendations,updated_time,ad_review_feedback,bid_info,delivery_info,status,effective_status,adcreatives.limit(500){place_page_set_id,object_story_spec{instagram_actor_id,link_data{link},page_id},image_crops,image_url,status,thumbnail_url},name,clicks,spent,reach,link_ctr,impressions},date{$datetime},funding_source_details,business{name,link},adrules_library{name},current_unbilled_spend,adspaymentcycle,spend_cap,amount_spent,age,disable_reason,account_status,balance,all_payment_methods{pm_credit_card{account_id,credential_id,display_string,exp_month,exp_year}},currency,timezone_name,created_time,name,status,adtrust_dsl";
$req = new FbRequests();
$resp = $req->Get($acc, "me/adaccounts?$requestParams");
ResponseFormatter::Respond($resp);