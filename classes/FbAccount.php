<?php

class FbAccount
{
    public string $name;
    public string $userId;
    public string $token;
    public ?string $dtsg;
    public array $cookies;
    public ?RemaskProxy $proxy;

    public function __construct(string $name, string $token, string $cookies, string $dtsg = null, RemaskProxy $proxy = null)
    {
        $jsonCookies = json_decode($cookies, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            die("JSON Error: " . json_last_error_msg());
        }

        $this->userId = $jsonCookies[array_search('c_user', array_column($jsonCookies, 'name'))]['value'] ?? '';
        $this->name = $name;
        $this->token = $token;
        $this->cookies = $jsonCookies;
        $this->dtsg = $dtsg;
        $this->proxy = $proxy;
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'token' => $this->token,
            'cookies' => $this->cookies,
            'dtsg' => $this->dtsg,
            'proxy' => $this->proxy?->toArray()
        ];
    }

    public static function fromArray($accountData): FbAccount
    {
        $proxy = is_string($accountData['proxy']) ?
            RemaskProxy::fromSemicolonString($accountData['proxy']) :
            RemaskProxy::fromArray($accountData['proxy']);
        if (is_string($accountData['cookies'])){
            $cookies = $accountData['cookies'];
        } else{
            $cookies= json_encode($accountData['cookies']);
        }

        return new FbAccount(
            $accountData['name'],
            $accountData['token'],
            $cookies,
            $accountData['dtsg'] ?? null,
            $proxy
        );
    }

    public function getCurlCookies(): string
    {
        $cookieString = '';
        foreach ($this->cookies as $cookie) {
            $cookieString .= "{$cookie['name']}={$cookie['value']}; ";
        }
        return rtrim($cookieString, '; ');
    }
}