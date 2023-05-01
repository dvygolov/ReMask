<?php

class FbAccount
{
    public string $name;
    public string $token;
    public string $cookies;
    public ?RemaskProxy $proxy;

    public function __construct(string $name, string $token, string $cookies, RemaskProxy $proxy = null)
    {
        $this->name = $name;
        $this->token = $token;
        $this->cookies = $cookies;
        $this->proxy = $proxy;
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'token' => $this->token,
            'cookies' => $this->cookies,
            'proxy' => $this->proxy?->toArray()
        ];
    }

    public static function fromArray($accountData): FbAccount
    {
        $proxy = is_string($accountData)?
            RemaskProxy::fromSemicolonString($accountData['proxy']):
            RemaskProxy::fromArray($accountData['proxy']);
        return new FbAccount(
            $accountData['name'],
            $accountData['token'],
            $accountData['cookies'],
            $proxy
        );
    }

    public function getCurlCookies(): string
    {
        $cookiesArray = json_decode($this->cookies, true);
        $cookieString = '';
        foreach ($cookiesArray as $cookie) {
            $cookieString .= "{$cookie['name']}={$cookie['value']}; ";
        }
        return rtrim($cookieString, '; ');
    }
}