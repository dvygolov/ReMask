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
$accId = $_POST['accid'];

$req = new FbRequests();

$variables = [
    "input" => [
        "client_mutation_id" => "1",
        "actor_id" => $acc->userId,
        "ad_account_id" => $accId,
        "ids_issue_ent_id" => "880164863403788",
        "appeal_comment" => "I'm not sure which policy was violated.",
        "callsite" => "ACCOUNT_QUALITY",
    ],
];
$jsonVars = json_encode($variables);

$dtsg = $req->GetDtsg($acc);
$body = "__a=1&fb_dtsg=" . urlencode($dtsg) . "&variables=" . urlencode($jsonVars) . "&doc_id=5197966936890203";
$resp = $req->PrivateApiPost($acc, $body);
$js = json_decode($resp['res'], true);
$policySent = ($js['data']['xfb_alr_ad_account_appeal_create']['success'] === true);
if (!$policySent) {
    $resp['res'] = null;
    $resp['error'] = "Couldn't send Policy Ticket!";
}
ResponseFormatter::Respond($resp);