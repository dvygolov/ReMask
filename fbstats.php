<?php
include 'settings.php';
include 'classes.php';
$serializer = new FBAccountSerializer(FILENAME);
$accounts = $serializer->deserialize();

$curl = curl_init();
$get = $_GET;
unset($get["acc_name"]);
$filteredAccounts = array_filter($accounts, function ($account) {
    return $account->name === $_GET["acc_name"];
});
$acc = !empty($filteredAccounts) ? reset($filteredAccounts) : null;

$cookiesArray = json_decode($acc->cookies, true);
$cookieString = '';
// Loop through the cookies array and format each cookie as "name=value;"
foreach ($cookiesArray as $cookie) {
    $cookieString .= "{$cookie['name']}={$cookie['value']}; ";
}
// Remove the trailing space and semicolon
$cookieString = rtrim($cookieString, '; ');

$headers = [
    "sec-fetch-dest: document",
    "sec-fetch-mode: navigate",
    "sec-fetch-site: none",
    "sec-fetch-user: ?1"
];
$userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
$optArray = array(
    CURLOPT_URL => "https://graph.facebook.com/v16.0/me/adaccounts?" . http_build_query($get) . "&access_token=" . $acc->token,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_COOKIE => $cookieString,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_USERAGENT => $userAgent
);
if ($acc->proxy !== null) {
    $optArray[CURLOPT_PROXYTYPE] = 'HTTP';
    $optArray[CURLOPT_PROXY] = $acc->proxy->ip;
    $optArray[CURLOPT_PROXYPORT] = $acc->proxy->port;
    $optArray[CURLOPT_PROXYUSERPWD] = $acc->proxy->login . ':' . $acc->proxy->password;
}
curl_setopt_array($curl, $optArray);
$html = curl_exec($curl);
$info = curl_getinfo($curl);
$error = curl_error($curl);
curl_close($curl);
if ($info['http_code'] !== 200)
    http_response_code($info['http_code']);
ob_start('ob_gzhandler');
header('Content-Encoding: gzip');
header("Content-Type: application/json");
$json = json_decode($html);
// Encode the object as a compact JSON string
$compactJsonString = json_encode($json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
echo $compactJsonString;
