<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

if (isset($_POST["name"]) && isset($_POST["token"]) && isset($_POST["cookies"])) {
    $serializer = new FbAccountSerializer(FILENAME);
    $accounts = $serializer->deserialize();
    $newAcc = FbAccount::fromArray($_POST);

    $accountExists = false;
    foreach ($accounts as &$account) {
        if ($account->name === $newAcc->name) {
            $accountExists = true;
            $account->token = $newAcc->token;
            $account->cookies = $newAcc->cookies;
            if (isset($newAcc->proxy)) {
                $account->proxy = $newAcc->proxy;
            }
            break;
        }
    }

    if (!$accountExists) {
        $accounts[] = $newAcc;
    }

    $serializer->serialize($accounts);
    ResponseFormatter::Respond(['res'=>json_encode($newAcc)]);
} else {
    ResponseFormatter::Respond(['error'=>"Name,Token or Cookies not set!"]);
}
