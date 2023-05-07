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
$acc = $serializer->getAccountByName($_POST['socname']);
if ($acc == null) die("No account with name " . $_POST['socname'] . " found!");
$req = new FbRequests();
$req->Get($acc,)

ResponseFormatter::Respond($resp);