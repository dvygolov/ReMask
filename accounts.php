<?php
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
require_once 'checkpassword.php';
require_once 'classes.php';

$serializer = new FBAccountSerializer(FILENAME);

if (isset($_GET["act"]) && $_GET["act"] == "delete" && isset($_GET["name"]))
    $accounts = $serializer->deleteAccountByName($_GET["name"]);
else
    $accounts = $serializer->deserialize();

if (isset($_POST["name"]) && isset($_POST["token"]) && isset($_POST["cookies"])) {
    $newAcc = isset($_POST['proxy']) ?
        new FacebookAccount($_POST["name"], $_POST["token"], $_POST["cookies"],  RemaskProxy::fromSemicolonString($_POST["proxy"])) :
        new FacebookAccount($_POST["name"], $_POST["token"], $_POST["cookies"]);
    $accounts[] = $newAcc;
    $serializer->serialize($accounts);
}
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
        <TD><a href='accounts.php?act=delete&name=<?= $accounts[$i]->name ?>'>[Delete]</a></TD>
    </TR>
    <?php } ?>
    </tbody>
</table>
<br/>
<br/>
    <b style="color:#c8ccd6">Add Account</b>
<br/>
<br/>
    <form name="add" method="post" action="accounts.php" onsubmit="return validate_form();">
        <input name="name" type="text" class="form-control" value="" placeholder="Name"/>
        <input name="token" type="text" class="form-control" value="" placeholder="Token"/>
        <input name="cookies" type="text" class="form-control" value="" placeholder="JSON-cookies"/>
        <input name="proxy" type="text" class="form-control" value="" placeholder="Proxy ip:port:login:pass"/>
        <input type="submit" name="additem" class="btn btn-primary" value="Add!"/>
    </form>
<br/>
<?= include 'copyright.php' ?>
<script>
    function validate_form() {
        let valid = true;
        const tokenInput = document.add.token.value;
        const cookiesInput = document.add.cookies.value;
        const proxyInput = document.add.proxy.value;

        if (document.add.name.value === "" ||
            tokenInput === "" ||
            cookiesInput === ""
        ) {
            alert("You need to fill ALL fields!");
            valid = false;
        } else {
            let cookiesParsed;
            try {
                cookiesParsed = JSON.parse(cookiesInput);
            } catch (e) {
                alert("Cookies must be a valid JSON array!");
                valid = false;
            }

            if (valid && !(Array.isArray(cookiesParsed))) {
                alert("Cookies must be a JSON array!");
                valid = false;
            }

            if (valid && !tokenInput.startsWith("EAAB")) {
                alert("Token must start with 'EAAB'!");
                valid = false;
            }

            if (valid) {
                const proxyElements = proxyInput.split(':');
                if (proxyElements.length !== 4) {
                    alert("Proxy must be in the format 'ip:port:login:pass'!");
                    valid = false;
                }
            }
        }
        return valid;
    }
</script>
</body>
</html>