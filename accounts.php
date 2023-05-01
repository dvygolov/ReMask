<?php
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
require_once __DIR__ . '/checkpassword.php';
require_once __DIR__ . '/classes/FBAccountSerializer.php';
require_once __DIR__ . '/classes/FbAccount.php';
require_once __DIR__ . '/classes/RemaskProxy.php';

$serializer = new FbAccountSerializer(FILENAME);
$accounts = $serializer->deserialize();
?>
<!DOCTYPE html>
<html lang="en">
<head class="text-center">
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=2, shrink-to-fit=no"/>
    <link href="styles/bootstrap.min.css" rel="stylesheet"/>
    <link href="styles/signin.css" rel="stylesheet"/>
    <link rel="icon" type="image/png" href="styles/img/favicon.png">
    <script src="styles/jquery-2.1.4.min.js"></script>
    <script src="styles/bootstrap.min.js"></script>
    <script src="scripts/accounts.js"></script>
    <title><?php include 'version.php' ?></title>
</head>
<body class="text-center">
<?= include 'menu.php' ?>
<br/>
<table class="centertable">
    <tbody style="color:#c8ccd6">

    <?php for ($i = 0; $i < count($accounts); $i++) { ?>
        <TR>
            <TD class='nameclmn'><?= $accounts[$i]->name ?></TD>
            <TD class='tokenclmn'><?= $accounts[$i]->token ?></TD>
            <TD><a onclick="delAccount(<?= $accounts[$i]->name ?>)">[Delete]</a></TD>
        </TR>
    <?php } ?>
    </tbody>
</table>
<br/>
<br/>
<b style="color:#c8ccd6">Add Account</b>
<br/>
<br/>
<form name="add">
    <input name="name" type="text" class="form-control" value="" placeholder="Name"/>
    <input name="token" type="text" class="form-control" value="" placeholder="Token"/>
    <input name="cookies" type="text" class="form-control" value="" placeholder="JSON-cookies"/>
    <input name="proxy" type="text" class="form-control" value="" placeholder="Proxy ip:port:login:pass"/>
    <input type="button" onclick="addAccount()" name="additem" class="btn btn-primary" value="Add!"/>
</form>
<br/>
<?= include 'copyright.php' ?>
</body>
</html>