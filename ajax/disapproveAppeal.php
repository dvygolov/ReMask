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
$url = "https://www.facebook.com/ads/integrity/appeals_case/creation/ajax/";
$body = "ad_account_id=$accId&adgroup_ids[0]=$adId";
$res = $req->PrivateApiPost($acc, $body, $url);

ResponseFormatter::Respond($res);
