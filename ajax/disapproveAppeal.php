<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
$serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
$acc = $serializer->getAccountByName($_POST['acc_name']);

$req = new FbRequests();
$accId = $_POST['accid'];
$adId = $_POST['adid'];
$dtsg = $req->GetDtsg($acc);
$url = "https://business.facebook.com/ads/integrity/appeals_case/creation/ajax/";
$body = "ad_account_id=$accId&adgroup_ids[0]=$adId&callsite=ACCOUNT_QUALITY&__a=1&fb_dtsg=". urlencode($dtsg);
$res = $req->PrivateApiPost($acc, $body, $url);

$responseArray = json_decode($res['res'], true);
$appealSent = null;
foreach ($responseArray['payload']['adgroupIDToSuccess']['__map'] as $map) {
    if ($map[0] == $adId) {
        $appealSent = $map[1];
        break;
    }
}

if ($appealSent === null) {
    $res['res'] = null;
    $res['error'] = "Ad ID not found in the response.";
} else if (!$appealSent){
    $res['res'] = null;
    $res['error'] =  "Appeal NOT Sent!";
}
ResponseFormatter::Respond($res);
