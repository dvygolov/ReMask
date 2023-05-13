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
$req = new FbRequests();
$resp = $req->Get($acc, "me/adaccounts?$requestParams");
ResponseFormatter::Respond($resp);
