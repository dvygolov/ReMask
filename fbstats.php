<?php
    $curl = curl_init();
    $optArray = array(
            CURLOPT_URL => "https://graph.facebook.com/v11.0/me/adaccounts?".http_build_query($_GET),
            CURLOPT_RETURNTRANSFER => true,
			CURLOPT_SSL_VERIFYPEER => false
			);
    curl_setopt_array($curl, $optArray);
    $html = curl_exec($curl);
    $info = curl_getinfo($curl);
    $error= curl_error($curl);
    curl_close($curl);
    echo $html;
?>
