<?php
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
require_once __DIR__ . '/checkpassword.php';
require_once __DIR__ . '/classes/FbAccountSerializer.php';
require_once __DIR__ . '/classes/FbAccount.php';
require_once __DIR__ . '/classes/RemaskProxy.php';

$serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
$accounts = $serializer->deserialize();
?>
<!DOCTYPE html>
<html lang="en">
<head class="text-center">
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=2, shrink-to-fit=no"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css" rel="stylesheet">
    <link href="styles/bootstrap.min.css" rel="stylesheet"/>
    <link href="styles/signin.css" rel="stylesheet"/>
    <link rel="icon" type="image/png" href="styles/img/favicon.png">
    <script src="styles/bootstrap.min.js"></script>
    <script src="scripts/accounts.js" type="module"></script>
    <title><?php include 'version.php' ?></title>
</head>
<body class="text-center">
<style>
    .form-container {
        display: grid;
        grid-template-columns: auto auto;
        column-gap: 10px;
        align-items: center;
    }

    label {
        text-align: right;
        padding-right: 10px;
        color: white;
    }

    .form-wrapper {
        display: flex;
        justify-content: center;
    }

    #addaccountbutton {
        margin-top: 10px;
    }
</style>

<?php include 'menu.php' ?>
<br/>
<table class="centertable">
    <tbody style="color:#c8ccd6">

    <?php for ($i = 0; $i < count($accounts); $i++) { ?>
        <TR>
            <TD class='nameclmn'><?= $accounts[$i]->name ?></TD>
            <TD style="margin-left: 10px;">
                <a href="javascript:void(0);" class="editaccount" data-name="<?= $accounts[$i]->name ?>">[Edit]</a>
            </TD>
            <TD style="margin-left: 10px;">
                <a href="javascript:void(0);" class="delaccount" data-name="<?= $accounts[$i]->name ?>">[Delete]</a>
            </TD>
        </TR>
    <?php } ?>
    </tbody>
</table>
<br/>
<br/>
<b style="color:#c8ccd6">Add Account</b>
<br/>
<br/>
<div class="form-wrapper">
    <form name="add" class="form-container">
        <label for="name">Name:</label>
        <input name="name" type="text" class="form-control" value="" placeholder="John Doe"/>

        <label for="token">Token:</label>
        <input name="token" type="text" class="form-control" value="" placeholder="EAAB...."/>

        <label for="cookies">Cookies:</label>
        <input name="cookies" type="text" class="form-control" value="" placeholder="in JSON format"/>

        <label for="proxy">Proxy:</label>
        <input name="proxy" type="text" class="form-control" value="" placeholder="type:ip:port:login:pass"/>

        <div></div>
        <button type="button" id="addaccountbutton" class="btn btn-primary">
            <i id="loadingIcon" class="fas fa-spinner fa-spin" style="display:none;"></i>
            ADD
        </button>
    </form>
</div>
<br/>
<?= include 'copyright.php' ?>
</body>
</html>