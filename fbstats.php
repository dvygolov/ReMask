<?php
    $curl = curl_init();
    $get=$_GET;
    unset($get["proxy"]);
    $optArray = array(
            CURLOPT_URL => "https://graph.facebook.com/v16.0/me/adaccounts?".http_build_query($get),
            CURLOPT_RETURNTRANSFER => true,
			CURLOPT_SSL_VERIFYPEER => false
			);
    if (isset($_GET['proxy'])){
        $proxy=explode(':',$_GET['proxy']);
        $optArray[CURLOPT_PROXYTYPE] = 'HTTP';
        $optArray[CURLOPT_PROXY] = $proxy[0];
        $optArray[CURLOPT_PROXYPORT] = $proxy[1];
        $optArray[CURLOPT_PROXYUSERPWD] = $proxy[2].':'.$proxy[3];
    }
    curl_setopt_array($curl, $optArray);
    $html = curl_exec($curl);
    $info = curl_getinfo($curl);
    $error= curl_error($curl);
    curl_close($curl);
    if ($info['http_code']!==200)
        http_response_code($info['http_code']);
    echo $html;
