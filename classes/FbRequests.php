<?php
require_once __DIR__ . '/FbAccount.php';
require_once __DIR__ . '/RemaskProxy.php';
require_once __DIR__ . '/FbAccountSerializer.php';

class FbRequests
{
    private string $api = "https://graph.facebook.com/v16.0/";

    public function ApiGet(FbAccount $acc, string $url): array
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
        return $this->Execute($acc, $optArray);
    }

    public function ApiPost(FbAccount $acc, string $url, string $body): array
    {
        $headers = [
            "content-type: application/x-www-form-urlencoded",
            "sec-ch-ua-mobile: ?0",
            'sec-ch-ua-platform: "Windows"',
            "sec-fetch-dest: empty",
            "sec-fetch-mode: cors",
            "sec-fetch-site: same-origin",
        ];
        $finalUrl = $this->api . $url;
        $finalBody = $body . "&access_token=" . $acc->token;

        $optArray = array(
            CURLOPT_URL => $finalUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true, // Set the request method to POST
            CURLOPT_POSTFIELDS => $finalBody, // Set the POST data
            CURLOPT_COOKIE => $acc->getCurlCookies(),
            CURLOPT_HTTPHEADER => $headers,
        );

        $acc->proxy?->AddToCurlOptions($optArray);

        return $this->Execute($acc, $optArray);
    }

    public function PrivateApiPost($acc, $body, $customUrl = null): array
    {
        $headers = [
            "content-type: application/x-www-form-urlencoded",
            "sec-ch-ua-mobile: ?0",
            'sec-ch-ua-platform: "Windows"',
            "sec-fetch-dest: empty",
            "sec-fetch-mode: cors",
            "sec-fetch-site: same-origin",
        ];

        $url = $customUrl ?? "https://www.facebook.com/api/graphql";
        $optArray = array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true, // Set the request method to POST
            CURLOPT_POSTFIELDS => $body, // Set the POST data
            CURLOPT_COOKIE => $acc->getCurlCookies(),
            CURLOPT_HTTPHEADER => $headers,
        );

        $acc->proxy?->AddToCurlOptions($optArray);

        return $this->Execute($acc, $optArray);
    }

    public function GetDtsg(FbAccount $acc): ?string
    {
        $resp = $this->RawGet($acc, "https://mbasic.facebook.com/photos/upload");
        $pattern = '/name="fb_dtsg"\s+value="([^"]+)"/';
        if (preg_match($pattern, $resp["res"], $matches)) {
            return $matches[1];
        }
        return null;
    }

    private function GetNewToken(FbAccount $acc): ?string
    {
        $res = $this->RawGet($acc, "https://adsmanager.facebook.com/ads/manager");

        $location = $this->GetHeader("Location", $res['headers']);
        if (str_contains($location, 'checkpoint') ||
            str_contains($location, 'login')) return null;

        $redirect = null;
        if (!preg_match('/window\.location\.replace\("([^"]+)/', $res['res'], $matches)) {
            $redirect = str_replace("\\", "", $matches[1]);
        }
        if ($redirect === null) {
            return $this->ParseToken($res['res']);
        } else {
            preg_match('/act=(\d+)/', $res['res'], $matches);
            $act = $matches[1];
            $finalUrl = "https://adsmanager.facebook.com/adsmanager?act={$act}&nav_source=no_referrer";
            $adsRes = $this->RawGet($acc, $finalUrl);
            return $this->ParseToken($adsRes['res']);
        }
    }


    private function ParseToken($text)
    {
        if (preg_match('/EAAB[^"]+/', $text, $matches)) {
            return $matches[0];
        }
        return null;
    }

    private function GetHeader(string $headerName, string $headers)
    {
        preg_match("/$headerName: (.*?)\n/", $headers, $matches);
        $header = isset($matches[1]) ? trim($matches[1]) : null;
        return $header;
    }

    private function RawGet(FbAccount $acc, string $url): string
    {
        $headers = [
            "sec-fetch-dest: document",
            "sec-fetch-mode: navigate",
            "sec-fetch-site: none",
            "sec-fetch-user: ?1"
        ];
        $optArray = array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_COOKIE => $acc->getCurlCookies(),
            CURLOPT_HTTPHEADER => $headers,
        );
        return $this->Execute($acc, $optArray);
    }

    private function Execute(FbAccount $acc, array $optArray): array
    {
        $userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36";
        $optArray[CURLOPT_USERAGENT] = $userAgent;
        $optArray[CURLOPT_SSL_VERIFYPEER] = false;
        $optArray[CURLOPT_HEADER] = true;
        $curl = curl_init();
        curl_setopt_array($curl, $optArray);
        $res = curl_exec($curl);
        $info = curl_getinfo($curl);
        $error = curl_error($curl);
        $header = null;
        if ($res !== false) {
            $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
            $header = substr($res, 0, $header_size);
            $res = substr($res, $header_size);
        }
        curl_close($curl);
        if (str_contains($res, "Error loading application")) {
            $token = $this->GetNewToken($acc);
            if ($token !== null) {
                $acc->token = $token;
                $serializer = new FbAccountSerializer(ACCOUNTSFILENAME);
                $serializer->addOrUpdateAccount($acc);
                return $this->Execute($acc, $optArray);
            }
        }
        return [
            "res" => $res,
            "header" => $header,
            "info" => $info,
            "error" => $error
        ];
    }
}