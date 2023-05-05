<?php

class FbAccount
{
    public string $name;
    public string $token;
    public ?string $dtsg;
    public array $cookies;
    public ?RemaskProxy $proxy;

    public function __construct(string $name, string $token, string $cookies, string $dtsg = null, RemaskProxy $proxy = null)
    {
        $this->name = $name;
        $this->token = $token;
        $this->cookies = json_decode($cookies, true);
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
        $cookies = is_string($accountData['cookies']) ?
            $accountData['cookies'] :
            json_encode($accountData['cookies']);

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