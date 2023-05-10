<?php
require_once __DIR__.'/../settings.php';
require_once __DIR__.'/../checkpassword.php';
require_once __DIR__.'/../classes/RemaskProxy.php';
require_once __DIR__.'/../classes/FbAccount.php';
require_once __DIR__.'/../classes/FbAccountSerializer.php';
require_once __DIR__.'/../classes/FbRequests.php';
require_once __DIR__.'/../classes/ResponseFormatter.php';

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
$serializer = new FbAccountSerializer(FILENAME);
$acc = $serializer->getAccountByName($_POST['acc_name']);
if ($acc == null) die("No account with name " . $_POST['acc_name'] . " found!");
$rules = json_decode($_POST['rules'], true);
$accId = $_POST['accid'];
$batch = [];
foreach ($rules as $rule) {
    $evspecstr = json_encode($rule['evaluation_spec']);
    $exspecstr = json_encode($rule['execution_spec']);
    $shedspecstr = json_encode($rule['schedule_spec']);

    $batchItem = [
        'name' => $rule['name'],
        'method' => 'POST',
        'body' => "name={$rule['name']}&evaluation_spec={$evspecstr}&execution_spec={$exspecstr}&schedule_spec={$shedspecstr}&status=ENABLED",
        'relative_url' => "act_{$accId}/adrules_library"
    ];

    $batch[] = $batchItem;
}

$batchJson = urlencode(json_encode($batch));

$req = new FbRequests();
$resp = $req->Post($acc, "", "batch=$batchJson&include_headers=false");
if (!$resp['error']) {
    $batchJson = json_decode($resp['res'], true);
    foreach ($batchJson as $batchItem){
        if ($batchItem['code']!=200) {
            $resp['res']='';
            $resp['error'] = json_decode($batchItem['body'],true)['error']['message'];
            break;
        }
    }
}

ResponseFormatter::Respond($resp);