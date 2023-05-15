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
if ($acc == null) die("No account with name " . $_POST['acc_name'] . " found!");
$rules = explode(",", $_POST['rules']);
$batch = [];
foreach ($rules as $rule) {
    $batchItem = [
        'name' => $rule,
        'method' => 'DELETE',
        'relative_url' => $rule
    ];
    $batch[] = $batchItem;
}

$batchJson = urlencode(json_encode($batch));

$req = new FbRequests();
$resp = $req->ApiPost($acc, "", "batch=$batchJson&include_headers=false");
if (!$resp['error']) {
    $batchJson = json_decode($resp['res'], true);
    foreach ($batchJson as $batchItem){
        if ($batchItem['code']!=200) {
            $resp['res']='';
            $resp['error'] = $batchItem['body'];
            break;
        }
    }
}

ResponseFormatter::Respond($resp);
