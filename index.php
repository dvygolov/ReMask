<?php
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
require_once 'checkpassword.php';
require_once 'classes.php';

$serializer = new FBAccountSerializer(FILENAME);
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
    <script src="scripts/loadstat.js"></script>
    <title><?php include 'version.php' ?></title>
</head>
<body class="text-center">
<div class="form-group">
    <?= include 'menu.php' ?>
    <br/>
    <b style="color:#c8ccd6">Statistics</b>
    <br/>
    <br/>
    <select id="selectbox2" name="selectbox2" class="form-control" style="text-align:center;">
        <option value=all>Load all</option>
        <?php foreach ($accounts as $acc) {?>
                <option value="<?=$acc->name?>"><?=$acc->name?></option>
        <?php } ?>
    </select>
    <select id='selectbox3' class='form-control'>
        <option value='active'>Only active</option>
        <option value='all'>Show All</option>
        <option value='active_total'>Total Active</option>
        <option value='all_total'>All Total</option>
    </select>
    <select id='selectbox1' class='form-control'>
        <option value='today'>Today</option>
        <option value='yesterday'>Yesterday</option>
        <option value='lifetime'>Maximum</option>
        <option value='last_7d'>Last 7 days</option>
        <option value='last_month'>Last Month</option>
    </select>
    <input type="button" name="load" onclick="load_data()" class="btn btn-primary" value="Load"/>
    <br/>
    <br/>
    <form method="post">
        <input type="submit" name="delete" class="btn btn-danger" value="Clear"/>
    </form>
</div>
<table class="table table-dark table-hover" style="font-size: 16px;">
    <tbody id="statBody"></tbody>
</table>
<div id='message'></div>
<?= include 'copyright.php' ?>
<script type="text/javascript">
    function clearTable() {
        let statBody = document.getElementById("statBody");
        statBody.innerHTML = '';
    }

    async function load_data() {
        clearTable();
        await loadAllStatistics();
    }
</script>
</body>
</html>