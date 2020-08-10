<?php
include 'functions.php';
include 'settings.php';
if(!isset($_GET["password"]) || $_GET["password"] !== $password) die(); 
?>
<html>
<head>
    <meta charset="utf8">
    <link rel="stylesheet" href="styles/bootstrap.min.css">
    <link href="styles/signin.css" rel="stylesheet">
	<link rel="icon" type="image/png" href="styles/img/favicon.png">
	<script src="scripts/js.js"></script>;
    <title>ReMask Panel</title>
</head>
<body class="text-center">
	<h2>	
	  <a href="tokens.php?password=<?=$_GET["password"];?>">Токены</a> |
	  <a href="index.php?password=<?=$_GET["password"];?>">Статистика</a> |
	  <a href="rules.php?password=<?=$_GET["password"];?>">Автоправила</a>
	</h2>
<?

$action = $_GET["act"];
switch ($action){
	case "add":
	{
		if(file_exists($fileName)){     
			$fileLines = file($fileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
			$countLines = 0;
			$delimiter = ","; //CSV delimiter character: , ; /t
			$enclosure = '"'; //CSV enclosure character: " ' 
			foreach ($fileLines as $line) {
				if(trim($line) === '') continue;
				$arrayFields = array_map('trim', str_getcsv($line, $delimiter, $enclosure)); //Convert line to array
				AddAcc($arrayFields[1],$arrayFields[0]);
			}
		}
		Redirect("rules.php?password=".$_GET["password"]);
		exit;
		break;
	}
	case "delete":
	{
		$text = file_get_contents($baseFileName);
		$array = explode("\r\n",$text);
		$numstroki = $_GET["line"];
		unset($array[$numstroki]);	
		$text = implode("\r\n",$array);
		file_put_contents($baseFileName,$text);
		$text = file_get_contents($baseFileName);
		Redirect("rules.php?password=".$_GET["password"]);
		exit;		
		break;
	}
	case "reload":
	{
		$text = file_get_contents($baseFileName);
		$array = explode("\r\n",$text);
		$numstroki = $_GET["line"];
		$token = $_GET["token"];
		$nname = $_GET["nname"];
		$url = "https://graph.facebook.com/v6.0/me/adaccounts?fields=business{name},name,account_id,created_time,adrules_library&access_token=".$token;
		$parametrs = array(
			'http' => array(
			'ignore_errors' => true,
			'method'  => 'GET'
			)
		);
		$result = file_get_contents($url, false, stream_context_create($parametrs));
		$json = json_decode($result,true);
		if(isset($json["error"])){
			$text = $json["error"]["message"];
			$html = '<div align="center">'.$text.'<br><br><br><input type="button" value="Назад" onclick="window.history.back();"></div>';
			die($html);
		}
		$line = array();
		for($i=0;$i<count($json["data"]);$i++){
			if(!isset($json["data"][$i]["business"])){
				$temparr["name"] = $json["data"][$i]["name"];
				$temparr["id"] = $json["data"][$i]["account_id"];
				$temparr["countadr"] = count($json["data"][$i]["adrules_library"]["data"]);
				$temp = $json["data"][$i]["created_time"];
				$temp = str_replace("T"," ",$temp);
				$temp = substr($temp, 0, -5);
				$temp = strtotime($temp);
				$temparr["created_time"] = $temp;
				$qwerty["1soc"][] = $temparr;
			
			} else {
				$bname = $json["data"][$i]["business"]["name"];
				$bid = $json["data"][$i]["business"]["id"];
				$temparr["name"] = $json["data"][$i]["name"];
				$temparr["id"] = $json["data"][$i]["account_id"];
				$temparr["countadr"] = count($json["data"][$i]["adrules_library"]["data"]);
				$temp = $json["data"][$i]["created_time"];
				$temp = str_replace("T"," ",$temp);
				$temp = substr($temp, 0, -5);
				$temp = strtotime($temp);
				$temparr["created_time"] = $temp;
				$temparr["bid"] = $bid;
				$line[$bname][] = $temparr;
			}
		}
		if($qwerty==""){
			$qwerty["1soc"][0]["name"] = "NOT FOUND";
			$qwerty["1soc"][0]["id"] = "0";
			$qwerty["1soc"][0]["countadr"] = 0;
			$qwerty["1soc"][0]["created_time"] = "1";
		}
		$line = $qwerty + $line + array("token"=>$token) + array("nname"=>$nname);
		foreach($line as $key => $value){
			if(($key!="token")&&($key!="nname")){
				$data_year=array();
				foreach($line[$key] as $key2=>$arr2){
					$data_year[$key2]=$arr2["created_time"];
				}
				array_multisort($data_year,SORT_ASC, SORT_NUMERIC, $line[$key]);
			}
		}
		$text = json_encode($line);
		$text = base64_encode($text);
		$array[$numstroki] = $text;
		$text = implode("\r\n",$array);
		file_put_contents($baseFileName,$text);
	
		Redirect("rules.php?password=".$_GET["password"]);
		exit;		
		break;
	}
	case "save":
	{
		$token = $_GET["token"];
		$aid = $_GET["aid"];
		if($_POST["name"]!="" && $_POST["data"]!=""){
			file_put_contents("presets/".$_POST["name"],$_POST["data"]);
			$pwd=$_GET["password"];
			Redirect("rules.php?password=$pwd");
			exit;
		}
		$adrules = ReadAdrules($aid,$token);
		$str = ArrToStr($adrules,true);
		echo '<div align="center"><form method="post"><textarea rows="20" cols="150" class="form-control" name="data">'.$str.'</textarea><br><input name="name" class="form-control" placeholder="Имя шаблона"><input type="submit" class="btn btn-primary" value="Сохранить шаблон"></form><br><br><input type="button" class="btn btn-danger" value="Назад" onclick="window.history.back();"></div>';
		exit;		
		break;
	}
	case "write":
	{
		$token = $_GET["token"];
		$aid = $_GET["aid"];
		echo '<div align="center"><form method="POST"><textarea name="rules" rows="20" cols="150"></textarea><br><br><input type="submit" value="Применить"></form><br><br><input type="button" value="Назад" onclick="window.history.back();"></div>';
		if(isset($_POST["rules"])){
			$rules = StrToArr($_POST["rules"], true);
			for($i=0;$i<count($rules);$i++){
				$rule = $rules[$i];
				WriteAdrules($rule,$token,$aid);
				sleep(2);
			}
			echo var_dump($rules);
		}
		exit;		
		break;
	}
	case "writemult":
	{
		$filename = $_POST["preset"];
		$error_text = "";
		$array = array();
		for($i=0;$i<count($_POST["check"]);$i++){
			$array[$i]["id"] = explode("|",$_POST["check"][$i])[0];
			$array[$i]["token"] = explode("|",$_POST["check"][$i])[1];
		}
		$data = file_get_contents("./presets/".$filename);
		for($j=0;$j<count($array);$j++){
			$rules = StrToArr($data, true);
			for($i=0;$i<count($rules);$i++){
				$rule = $rules[$i];
				$error = WriteAdrules($rule,$array[$j]["token"],$array[$j]["id"]);
				$json = json_decode($error,true);
				if(isset($json["error"])){
					$error_text .= $array[$j]["id"].": ".$json["error"]["message"]."<br>";
				}
				sleep(2);
			}
		}
		if($error_text!=""){
			$error_text = "<script src=\"js.js\"></script><div align=\"center\">Ошибки:<br><br>".$error_text."<br><br><br><input type=\"button\" value=\"Назад\" onclick=\"window.history.back();\"></div>";
			die($error_text);
		}
		Redirect("rules.php?password=".$_GET["password"]);
		exit;		
		break;
	}
	default:
	{
		$base = file_get_contents($baseFileName);
		$base = explode("\r\n",$base);
		$data = "";
		$i2=0;
		for($i=0;$i<count($base)-1;$i++){
			$base[$i] = base64_decode($base[$i]);
			$base[$i] = json_decode($base[$i],true);
			$data .= "<tr><td></td></tr>";
			foreach($base[$i] as $key => $value){
				if(($key!="token")&&($key!="nname")){
					$trans = $key;
					if($trans=="1soc"){
						$link_read = "<a href='rules.php?act=save&aid=".$base[$i][$key][0]["id"]."&token=".$base[$i]["token"]."&password=".$_GET["password"]."'>[Save]</a>";
						$link_reload = "<a href='rules.php?act=reload&nname=".$base[$i]["nname"]."&line=".$i."&token=".$base[$i]["token"]."&password=".$_GET["password"]."'>[Update]</a>";
						$link_delete = "<a href='rules.php?act=delete&line=".$i."&password=".$_GET["password"]."'>[Delete]</a>";
						$link = $link_read." ".$link_reload." ".$link_delete;
						$trans = "Соц.";
						$tempi = $i+1;
						$countalladr = 0;
						foreach($base[$i] as $key222 => $value222){
							for($tttempi2=0;$tttempi2<count($base[$i][$key222]);$tttempi2++){
								if(($key222!="token")&&($key222!="nname")){
									$countalladr = $countalladr + $base[$i][$key222][$tttempi2]["countadr"];
								}
							}
						}
						if(count($base[$i])>2){
							$linkcolone = "<a href=\"#\" onclick=\"colapse1('".$i."',this);\">+</a>";
						}
						$checkname = $base[$i][$key][0]["id"]."|".$base[$i]["token"];
						$data .= "<tr $style><td>$linkcolone $tempi <input type='checkbox' name='check[]' value='".$checkname."'></td><td>Соц</td><td>".$base[$i][$key][0]["id"]."</td><td>".$base[$i][$key][0]["name"]."</td><td>".$base[$i]["nname"]."</td><td>".$countalladr." (".$base[$i][$key][0]["countadr"].")</td><td>".$link."</td></tr>";
					} else {
						if(count($base[$i][$key])>=1){
							$linkcolone = "<a href=\"#\" onclick=\"colapse2('".$i2."',this);\">+</a>";
						}
						$style = "style=\"display: none;\" name=\"one_".$i."\"";
						$tempi22 = 0;
						for($tttempi=0;$tttempi<count($base[$i][$key]);$tttempi++){
							$tempi22 = $tempi22 + $base[$i][$key][$tttempi]["countadr"];
						}
						$data .= "<tr $style><td>$linkcolone $tempi</td><td>БМ</td><td>".$base[$i][$key][0]["bid"]."</td><td>".$trans."</td><td></td><td>".$tempi22."</td><td> </td></tr>";
					}
					
					$linkcolone = "";
					//$trans = "";
					$tempi = "";
					$style = "style=\"display: none;\" name=\"two_".$i2."\"";
					$i2++;
					for($j=0;$j<count($base[$i][$key]);$j++){
						$link_read = "<a href='rules.php?act=save&aid=".$base[$i][$key][$j]["id"]."&token=".$base[$i]["token"]."&password=".$_GET["password"]."'>[Save]</a>";
						$link = $link_read." ".$link_write;
						$checkname = $base[$i][$key][$j]["id"]."|".$base[$i]["token"];
						$data .= "<tr $style><td><input type='checkbox' name='check[]' value='".$checkname."'></td><td>РА</td><td>".$base[$i][$key][$j]["id"]."</td><td>".$base[$i][$key][$j]["name"]."</td><td></td><td>".$base[$i][$key][$j]["countadr"]."</td><td>".$link."</td></tr>";
					}
					$style = "";
				}
			}
		}
	}
}
?>

	<style>a{text-decoration:none;}</style>
	<div align="center">
		<br/>
		<form method="POST" action="rules.php?act=add&password=<?=$_GET["password"]?>">
			<input type='submit' class='btn btn-success' value='Загрузить данные по аккам из токенов'>
		</form>
		<br/>
		<form method="POST" action="rules.php?act=writemult&password=<?=$_GET["password"]?>">
		<table class="table table-dark table-hover" style="font-size: 16px;">
			<tr><th>#</th><th>Type</th><th>Id</th><th>Name</th><th>Name2</th><th>А.П.</th><th>Act</th></tr>
			<?=$data;?>
		</table>
		
		<b style="color:#c8ccd6">Шаблоны</b> 
		<br/>
		<select name='preset' class='form-control' size='8'style='width:900;' required>
		<?
		$dir = __DIR__.'/presets';
		$files = scandir($dir);
		for($i=0;$i<count($files);$i++){
			if(($files[$i]!=".")&&($files[$i]!=".."))
				echo "<option>".$files[$i]."</option>";
		}
		?>
		</select>
		<br><br>
		<input type='submit' class='btn btn-success' value='Залить выбранный шаблон'>
	</form>
	</div>
	<br/>
	<a href="https://vk.com/tron_cpa">©ТРОН</a> | <a href="https://teleg.run/adamusfb">Scripts by Adam</a> | <a href="https://vk.com/bearded_cpa">Бородатый арбитраж</a> | <a href="https://vk.com/yellowweb">Жёлтый Веб</a>
    </body>
</html>