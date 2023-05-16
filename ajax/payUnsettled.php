<?php
require_once __DIR__ . '/../settings.php';
require_once __DIR__ . '/../checkpassword.php';
require_once __DIR__ . '/../classes/RemaskProxy.php';
require_once __DIR__ . '/../classes/FbAccount.php';
require_once __DIR__ . '/../classes/FbAccountSerializer.php';
require_once __DIR__ . '/../classes/FbRequests.php';
require_once __DIR__ . '/../classes/ResponseFormatter.php';

$serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
$accName = $_POST['acc_name'];
$acc = $serializer->getAccountByName($accName);
if ($acc == null) die("No account with name $accName found!");

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
$input['transaction_initiation_source'] = "CUSTOMER";
$ijson['input'] = $input;
$vars = json_encode($ijson);

$req = new FbRequests();
$dtsg = $req->GetDtsg($acc);
$resp = $req->PrivateApiPost($acc, "fb_dtsg=$dtsg&__a=1&doc_id=5553047091425712&variables=$vars","https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&");

ResponseFormatter::Respond($resp);