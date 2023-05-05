<?php
require_once __DIR__ . '/FbAccount.php';
require_once __DIR__ . '/RemaskProxy.php';

class FbRequests
{
    private string $api = "https://graph.facebook.com/v16.0/";

    public function Get(FbAccount $acc, string $url): array
    {
        $headers = [
            "sec-fetch-dest: document",
            "sec-fetch-mode: navigate",
            "sec-fetch-site: none",
            "sec-fetch-user: ?1"
        ];
        $finalUrl = str_contains($url, "?") ?
            $this->api . $url . "&access_token=" . $acc->token :
            $this->api . $url . "?access_token=" . $acc->token;
        $optArray = array(
            CURLOPT_URL => $finalUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIE => $acc->getCurlCookies(),
            CURLOPT_HTTPHEADER => $headers,
        );
        $acc->proxy?->AddToCurlOptions($optArray);
        return $this->execute($optArray);
    }

    public function GetDtsg(FbAccount $acc)
    {
        $headers = [
            "sec-fetch-dest: document",
            "sec-fetch-mode: navigate",
            "sec-fetch-site: none",
            "sec-fetch-user: ?1"
        ];
        $optArray = array(
            CURLOPT_URL => "https://mbasic.facebook.com/photos/upload",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIE => $acc->getCurlCookies(),
            CURLOPT_HTTPHEADER => $headers,
        );
        $response = execute($optArray);

        $pattern = '/name="fb_dtsg"\s+value="([^"]+)"/';
        if (preg_match($pattern, $response["res"], $matches)) {
            return $matches[1];
        }
        return null;
    }

    private function execute($optArray): array
    {
        $userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
        $optArray[CURLOPT_USERAGENT] = $userAgent;
        $optArray[CURLOPT_SSL_VERIFYPEER] = false;

        $curl = curl_init();
        curl_setopt_array($curl, $optArray);
        $res = curl_exec($curl);
        $info = curl_getinfo($curl);
        $error = curl_error($curl);
        curl_close($curl);
        return [
            "res" => $res,
            "info" => $info,
            "error" => $error
        ];
    }

}