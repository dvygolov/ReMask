<?php
//if (notSentDisapproved.length == 0) return true;
//  var body = {
//    ad_account_id: accountId,
//    callsite: "ACCOUNT_QUALITY",
//    __user: uid,
//    __a: 1,
//    fb_dtsg: dtsg,
//    lsd: lsd,
//  };
//
//  for (let i = 0; i < notSentDisapproved.length; i++) {
//    let key = `adgroup_ids[${i}]`;
//    body[key] = notSentDisapproved[i];
//  }
//
//  let subDomain = getSubDomain();
//  let graphUrl = `https://${subDomain}.facebook.com/ads/integrity/appeals_case/creation/ajax/`;
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
$serializer = new FbAccountSerializer(FILENAME);
$acc = $serializer->getAccountByName($_POST['acc_name']);
$accId = $_POST['accid'];

$req = new FbRequests();
$resp = $req->Get($acc, "me");
$me = json_decode($resp['res'], true);

$variables = [
    "input" => [
        "client_mutation_id" => "1",
        "actor_id" => $me['id'],
        "ad_account_id" => $accId,
        "ids_issue_ent_id" => "880164863403788",
        "appeal_comment" => "I'm not sure which policy was violated.",
        "callsite" => "ACCOUNT_QUALITY",
    ],
];
$jsonVars = json_encode($variables);

$dtsg = $req->GetDtsg($acc);

$resp = $req->PrivatePost(
    $acc,
    "__a=1&fb_dtsg=" . urlencode($dtsg) . "&variables=" . urlencode($jsonVars) . "&doc_id=5197966936890203");
$js = json_decode($resp['res'], true);
$policySent = ($js['data']['xfb_alr_ad_account_appeal_create']['success'] === true);
if (!$policySent) {
    $resp['res'] = null;
    $resp['error'] = "Couldn't send Policy Ticket!";
}
ResponseFormatter::Respond($resp);
