<?
function Redirect($url){
	echo "<script type='text/javascript'> window.location='$url';</script>";
	return;
}

function AddAcc($token,$nname){
	if(($token!="")&&($token!="null")){
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
		$text.= "\r\n";
		file_put_contents("base.txt",$text, FILE_APPEND | LOCK_EX);
	}
}

function ReadAdrules($aid,$token){
	$url_read = "https://graph.facebook.com/v5.0/me/adaccounts?fields=adrules_library{id,account_id,created_by,created_time,evaluation_spec,execution_spec,name,schedule_spec,status,updated_time}&locale=ru_RU&access_token=".$token;
	//die($url_read);
	$response = file_get_contents($url_read);
	$json = json_decode($response,true);
	$num = 0;
	rest:
	if("act_".$aid!=$json["data"][$num]["id"]){
		$num++;
		goto rest;
	}
	for($i=0;$i<count($json["data"][$num]["adrules_library"]["data"]);$i++){
		$data[$i][0] = json_encode($json["data"][$num]["adrules_library"]["data"][$i]["evaluation_spec"]);
		$data[$i][1] = json_encode($json["data"][$num]["adrules_library"]["data"][$i]["execution_spec"]);
		$data[$i][2] = $json["data"][$num]["adrules_library"]["data"][$i]["name"];
		$data[$i][3] = json_encode($json["data"][$num]["adrules_library"]["data"][$i]["schedule_spec"]);
		$data[$i][4] = $json["data"][$num]["adrules_library"]["data"][$i]["status"];
	}
	return $data;
}
function WriteAdrules($rule,$token,$id){
	$url_write = "https://graph.facebook.com/v6.0/act_".$id."/adrules_library?access_token=".$token;
	$params = array(
		'account_id' => $id,
		'evaluation_spec' => $rule[0],
		'execution_spec' => $rule[1],
		'name' => $rule[2],
		'schedule_spec' => $rule[3],
		'status' => $rule[4]
	);
	$parametrs = array(
		'http' => array(
		'ignore_errors' => true,
		'method'  => 'POST',
		'header'  => "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:52.0) Gecko/20100101 Firefox/52.0\r\n",
		'content' => http_build_query($params)
		)
	);
	$result = file_get_contents($url_write, false, stream_context_create($parametrs));
	return $result;
}
function ArrToStr($array, $encode = false){
	$result = "";
	for($i=0;$i<count($array);$i++){
		$result.= implode("!=!=!",$array[$i]);
		$result.= "#@#@#";
	}
	$result = substr($result, 0, -5);
	if($encode==true) $result = base64_encode($result);
	return $result;
}
function StrToArr($str, $encode = false){
	if($encode==true) $str = base64_decode ($str);
	$temparr = explode("#@#@#",$str);
	for($i=0;$i<count($temparr);$i++){
		$array[$i] = explode("!=!=!",$temparr[$i]);
	}
	return $array;
}
?>