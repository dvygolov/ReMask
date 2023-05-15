<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

if (!isset($_GET["name"])) {
    ResponseFormatter::Respond(['error' => "Name not set!"]);
    exit;
}
$serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
$acc = $serializer->getAccountByName($_GET["name"]);
ResponseFormatter::Respond(['res' => json_encode($acc)]);
