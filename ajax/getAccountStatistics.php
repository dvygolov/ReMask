<?php
require_once __DIR__.'/../settings.php';
require_once __DIR__.'/../checkpassword.php';
require_once __DIR__.'/../classes/RemaskProxy.php';
require_once __DIR__.'/../classes/FbAccount.php';
require_once __DIR__.'/../classes/FbAccountSerializer.php';
require_once __DIR__.'/../classes/FbRequests.php';
require_once __DIR__.'/../classes/ResponseFormatter.php';

$serializer = new FbAccountSerializer(FILENAME);
$acc = $serializer->getAccountByName($_GET['acc_name']);
$get = $_GET;
unset($get["acc_name"]);
$req = new FbRequests();
$resp = $req->Get($acc,"me/adaccounts?" . http_build_query($get));
ResponseFormatter::Respond($resp);