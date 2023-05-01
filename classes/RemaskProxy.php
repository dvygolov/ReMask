<?php

class RemaskProxy
{
    public string $ip;
    public int $port;
    public string $login;
    public string $password;


    public function toArray(): array
    {
        return [
            'ip' => $this->ip,
            'port' => $this->port,
            'login' => $this->login,
            'password' => $this->password
        ];
    }

    public static function fromSemicolonString($proxyString): ?RemaskProxy
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

    public static function fromArray($proxyData): ?RemaskProxy
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

    public function AddToCurlOptions(array &$optArray): void
    {
        $optArray[CURLOPT_PROXYTYPE] = 'HTTP';
        $optArray[CURLOPT_PROXY] = $this->ip;
        $optArray[CURLOPT_PROXYPORT] = $this->port;
        $optArray[CURLOPT_PROXYUSERPWD] = $this->login . ':' . $this->password;
    }
}
