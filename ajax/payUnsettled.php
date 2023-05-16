<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

$serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
$acc = $serializer->getAccountByName($_GET['acc_name']);
if ($acc == null) die("No account with name " . $_GET['acc_name'] . " found!");

$accId = $_POST['accid'];
$paymentId = $_POST['paymentid'];
$sum = $_POST['sum'];
$currency = $_POST['currency'];

$ijson = array();
$input = array();
$input['client_mutation_id'] = "1";
$input['actor_id'] = $acc->userId;
$input['billable_account_payment_legacy_account_id'] = $accId;
$input['credential_id'] = $paymentId;
$paymentAmount = array();
$paymentAmount['amount'] = str_replace(',', '.', $sum);
$paymentAmount['currency'] = $currency;
$input['payment_amount'] = $paymentAmount;
$ijson['input'] = $input;
$vars = json_encode($ijson);

$req = new FbRequests();
$resp = $req->PrivateApiPost($acc, "doc_id=2367718093263338&variables=$vars");

ResponseFormatter::Respond($resp);