<?php
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
include 'settings.php';

if (isset($_POST["name"]) && isset($_POST["token"]) && isset($_POST["cookies"])){
	$name= $_POST["name"];
	$token=$_POST["token"];
    $cookies = $_POST["cookies"];
	$proxy='';
	if (isset($_POST['proxy']))
		$proxy=$_POST['proxy'];
	$accFile = fopen($fileName, 'a+');
	fwrite($accFile, "$name, $token, $cookies, $proxy\n");
	fflush($accFile);
	fclose($accFile);
}

if (isset($_GET["act"]) && $_GET["act"]=="delete" && isset($_GET["line"])){
    $line=$_GET["line"];
    $array = file($fileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    unset($array[$line-1]);	
    $text = implode("\n",$array)."\n";
    file_put_contents($fileName,$text);
}

if(!isset($_GET["password"]) || $_GET["password"] !== $password) die("No password or wrong password!");
?>
<!DOCTYPE html>
<html lang="en">
  <head class="text-center">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=2, shrink-to-fit=no" />
    <link href="styles/bootstrap.min.css" rel="stylesheet" />
    <link href="styles/signin.css" rel="stylesheet" />
	<link rel="icon" type="image/png" href="styles/img/favicon.png">
    <script src="styles/jquery-2.1.4.min.js"></script> 
    <script src="styles/bootstrap.min.js"></script>
    <title><?=include 'version.php'?></title>
  </head>
  <body class="text-center">
    <?= include 'menu.php'?>
	<br/>
	
    <?php
	//Load all account tokens from file
	if(file_exists($fileName)){     
   		$fileLines = file($fileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		$countLines = 0;
		$delimiter = ","; //CSV delimiter character: , ; /t
		$enclosure = '"'; //CSV enclosure character: " ' 
		$tableOutput='<table class="centertable"><tbody style="color:#c8ccd6">';
		foreach ($fileLines as $line) {
			if(trim($line) === '') continue;
			$countLines++;
			$arrayFields = array_map('trim', str_getcsv($line, $delimiter, $enclosure)); //Convert line to array
			$tableOutput.="<TR><TD class='cntclmn'>".$countLines."</TD>";
			$i=0;
			foreach ($arrayFields as $field)
			{
				if ($i==1)
					$tableOutput.="<TD class='tokenclmn'>".$field."</TD>"; //Add the token column
				else
					$tableOutput.="<TD class='accclmn'>".$field."</TD>"; //Add all other columns
				$i++;
            }
            $tableOutput.="<TD><a href='tokens.php?act=delete&line=".$countLines."&password=".$_GET["password"]."'>[Delete]</a></TD>";
			$tableOutput.="</TR>";
		}
		$tableOutput.="</tbody></TABLE>";
		echo $tableOutput;
	}
	else{
		$accsFile = fopen($fileName, 'a+');
		fflush($accsFile);
		fclose($accsFile);
	}
	?>
	<br/>
	<br/>
	<b style="color:#c8ccd6">Add Account</b>
	<br/>
	<br/>
	<form name="add" method="post" action="tokens.php?password=<?=$_GET['password'];?>" onsubmit="return validate_form();">
	  <input name="name" type="text" class="form-control" value="" placeholder="Name" />
	  <input name="token" type="text" class="form-control" value="" placeholder="Token" />
      <input name="cookies" type="text" class="form-control" value="" placeholder="JSON-cookies" />
	  <input name="proxy" type="text" class="form-control" value="" placeholder="Proxy ip:port:login:pass" />
	  <input type="submit" name="additem" class="btn btn-primary" value="Add!" />
	</form>
	<br/>
    <?= include 'copyright.php'?>
	<script>
	function validate_form (){
		let valid = true;
		if (document.add.name.value == "" ||
            document.add.token.value == "" ||
            document.add.cookies.value == ""
        ){
			alert("You need to fill ALL fields!");
			valid = false;
		}
		return valid;
	}
	</script>
  </body>
</html>