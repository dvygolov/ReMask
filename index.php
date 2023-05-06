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
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/png" href="styles/img/favicon.png">
    <script src="styles/bootstrap.min.js"></script>
    <title><?php include 'version.php' ?></title>
</head>
<body class="text-center">
<div class="form-group">
    <?php include 'menu.php' ?>
    <br/>
    <b style="color:#c8ccd6">Statistics</b>
    <br/>
    <br/>
    <select id="accNames" class="form-control" style="text-align:center;">
        <option value="all">Load all</option>
        <?php foreach ($accounts as $acc) { ?>
            <option value="<?= $acc->name ?>"><?= $acc->name ?></option>
        <?php } ?>
    </select>
    <select id="showParam" class='form-control'>
        <option value='active'>Only active</option>
        <option value='all'>Show All</option>
    </select>
    <select id='dateRange' class='form-control'>
        <option value='today'>Today</option>
        <option value='yesterday'>Yesterday</option>
        <option value='lifetime'>Maximum</option>
        <option value='last_7d'>Last 7 days</option>
        <option value='last_month'>Last Month</option>
    </select>
    <input type="button" id="loadstats" class="btn btn-primary" value="Load"/>
    <br/>
    <br/>
</div>
<table class="table table-dark table-hover" style="font-size: 16px;">
    <tbody id="statBody"></tbody>
</table>
<script src="scripts/main.js" type="module"></script>
<div id='message'></div>
<?= include 'copyright.php' ?>
</body>
</html>