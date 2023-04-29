<?php

class RemaskProxy
{
    public $ip;
    public $port;
    public $login;
    public $password;


    public function toArray()
    {
        return [
            'ip' => $this->ip,
            'port' => $this->port,
            'login' => $this->login,
            'password' => $this->password
        ];
    }

    public static function fromSemicolonString($proxyString)
    {
        if (!$proxyString) return null;
        $p = new RemaskProxy();
        $parts = explode(':', $proxyString);
        if (count($parts) === 4) {
            $p->ip = $parts[0];
            $p->port = (int)$parts[1];
            $p->login = $parts[2];
            $p->password = $parts[3];
            return $p;
        } else {
            throw new InvalidArgumentException('Invalid proxy string format. Expected format: ip:port:login:password');
        }
    }

    public static function fromArray($proxyData)
    {
        if (!$proxyData) {
            return null;
        }
        $p = new RemaskProxy();
        $p->ip = $proxyData['ip'];
        $p->port = $proxyData['port'];
        $p->login = $proxyData['login'];
        $p->password = $proxyData['password'];
        return $p;
    }
}

class FacebookAccount
{
    public $name;
    public $token;
    public $cookies;
    public $proxy;

    public function __construct($name, $token, $cookies, RemaskProxy $proxy = null)
    {
        $this->name = $name;
        $this->token = $token;
        $this->cookies = $cookies;
        $this->proxy = $proxy;
    }

    public function toArray()
    {
        return [
            'name' => $this->name,
            'token' => $this->token,
            'cookies' => $this->cookies,
            'proxy' => $this->proxy ? $this->proxy->toArray() : null
        ];
    }

    public static function fromArray($accountData)
    {
        $proxy = RemaskProxy::fromArray($accountData['proxy']);
        return new FacebookAccount(
            $accountData['name'],
            $accountData['token'],
            $accountData['cookies'],
            $proxy
        );
    }
}

class FBAccountSerializer
{
    private $filename;

    public function __construct($filename)
    {
        $this->filename = $filename;
    }

    public function serialize($facebookAccounts)
    {
        $accountsData = [];
        foreach ($facebookAccounts as $account) {
            $accountsData[] = $account->toArray();
        }

        $json = json_encode($accountsData, JSON_PRETTY_PRINT);
        file_put_contents($this->filename, $json);
    }

    public function deserialize()
    {
        if (!file_exists($this->filename)) return [];
        $json = file_get_contents($this->filename);
        $data = json_decode($json, true);

        $facebookAccounts = [];

        foreach ($data as $accountData) {
            $facebookAccounts[] = FacebookAccount::fromArray($accountData);
        }

        return $facebookAccounts;
    }

    public function deleteAccountByName($name)
    {
        // Deserialize the accounts from the JSON file
        $facebookAccounts = $this->deserialize();

        // Remove the account with the matching name
        $facebookAccounts = array_filter($facebookAccounts, function ($account) use ($name) {
            return $account->name !== $name;
        });

        // Re-index the array
        $facebookAccounts = array_values($facebookAccounts);

        // Serialize the updated array of accounts back to the JSON file
        $this->serialize($facebookAccounts);

        // Return the updated array of accounts
        return $facebookAccounts;
    }
}
