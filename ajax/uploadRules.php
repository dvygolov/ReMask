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
$acc = $serializer->getAccountByName($_POST['acc_name']);
if ($acc == null) die("No account with name " . $_POST['acc_name'] . " found!");
$rules = json_decode($_POST['rules']);
$req = new FbRequests();
$req->Get($acc,)
            foreach (var rule in rules)
            {

                batch.Add(JObject.Parse($@"
                    {{
                        ""name"":""{rule["name"]}"",
                        ""method"":""POST"",
                        ""body"":""evaluation_spec={evspecstr}&execution_spec={exspecstr}&locale=ru_RU&name={rule["name"]}&schedule_spec={shedspecstr}&status=ENABLED"",
                        ""relative_url"":""act_{ accId}/adrules_library""
                    }}"));
            }
            req.AddParameter("batch", batch);
            req.AddParameter("include_headers", false);
//ResponseFormatter::Respond($resp);