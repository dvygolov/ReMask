<?php 
include 'settings.php';
if(!isset($_GET["password"]) || $_GET["password"] !== $password) die(); 
?>
<!DOCTYPE html>
<html lang="en">
  <head class="text-center">
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width, initial-scale=2, shrink-to-fit=no" />
    <link href="styles/bootstrap.min.css" rel="stylesheet" />
    <link href="styles/signin.css" rel="stylesheet" />
	<link rel="icon" type="image/png" href="styles/img/favicon.png">
    <script src="styles/jquery-2.1.4.min.js"></script> 
    <script src="styles/bootstrap.min.js"></script>
    <script src="scripts/loadstat.js"></script>
    <title>ReMask Panel</title>
  </head>
  <body class="text-center">
  <div class="form-group">
	<h2>	
	  <a href="tokens.php?password=<?=$_GET["password"];?>">Токены</a> |
	  <a href="index.php?password=<?=$_GET["password"];?>">Статистика</a> |
	  <a href="rules.php?password=<?=$_GET["password"];?>">Автоправила</a>
	</h2>
	<br/>
	<b style="color:#c8ccd6">Загрузка статистики</b> 
	<br/>
	<br/>
	<select id="selectbox2" name="selectbox2" class="form-control" style="text-align:center;">
	<?
	if(file_exists($fileName)){     
   		$fileLines = file($fileName, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
		$countLines = 0;
		$delimiter = ","; //CSV delimiter character: , ; /t
		$enclosure = '"'; //CSV enclosure character: " ' 
		echo '<option value=all>Загрузить все</option>';
		foreach ($fileLines as $line) {
			if(trim($line) === '') continue;
			$arrayFields = array_map('trim', str_getcsv($line, $delimiter, $enclosure)); //Convert line to array
			printf("<option value='%s'>%s</option>",$arrayFields[1],$arrayFields[0]);
		}
	}
	?>
	</select>
	<select id='selectbox3' class='form-control'>
		<option value='active'>Только активные</option>
		<option value='all'>Показывать все</option>
		<option value='active_total'>Тотал по активным</option>
		<option value='all_total'>Тотал по всем</option>
	  </select> 
	  <select id='selectbox1' class='form-control'>
		<option value='today'>За сегодня</option>
		<option value='yesterday'>За вчера</option>
		<option value='lifetime'>За все время</option>
		<option value='last_7d'>За последние 7 дней</option>
		<option value='last_month'>За последний месяц</option>
	  </select> 
	  <input type="button" name="load" onclick="load_data()" class="btn btn-primary" value="Загрузить" />
	  <br/>
	  <br/>
	  <form method="post">
		<input type="submit" name="delete" class="btn btn-danger" value="Очистить стату" />
	  </form>
  </div>
  <table class="table table-dark table-hover" style="font-size: 16px;">
    <tbody id="statBody"></tbody>
  </table>
  <div id='message'></div>
  <a href="https://vk.com/tron_cpa">©ТРОН</a> | <a href="https://teleg.run/adamusfb">Scripts by Adam</a> | <a href="https://vk.com/bearded_cpa">Бородатый арбитраж</a> | <a href="https://vk.com/yellowweb">Жёлтый Веб</a>
  <script type="text/javascript">
    function clearTable(){
		var statBody=document.getElementById("statBody");
		var list = statBody.getElementsByTagName("tr");
		if (list.length==0) return;
		for (var k = list.length - 1; k <= 0; k--) {
			var item = list[k];
			statBody.removeChild(item);
		}
	}

    function load_data(){
        clearTable();  
        loadAllStatistics();
	}
  </script>
  </body>
</html>