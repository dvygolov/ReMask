<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

if (isset($_GET["name"]) && isset($_GET["token"]) && isset($_GET["cookies"])) {
    $serializer = new FbAccountSerializer(FILENAME);
    $accounts = $serializer->deserialize();
    $newAcc = FbAccount::fromArray($_GET);
    $accounts[] = $newAcc;
    $serializer->serialize($accounts);
    http_response_code(200);
}
else{
    http_response_code(500);
}