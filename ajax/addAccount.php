<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

if (isset($_POST["name"]) && isset($_POST["token"]) && isset($_POST["cookies"])) {
    $newAcc = FbAccount::fromArray($_POST);
    $serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
    $serializer->addOrUpdateAccount($newAcc);
    ResponseFormatter::Respond(['res'=>json_encode($newAcc)]);
} else {
    ResponseFormatter::Respond(['error'=>"Name,Token or Cookies not set!"]);
}