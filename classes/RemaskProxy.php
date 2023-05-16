<?php

class RemaskProxy
{
    public string $ip;
    public int $port;
    public string $login;
    public string $password;
    public string $type;


    public function toArray(): array
    {
        return [
            'type' =>$this->type,
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
        if (count($parts) === 5) {
            $p->type = $parts[0];
            $p->ip = $parts[1];
            $p->port = (int)$parts[2];
            $p->login = $parts[3];
            $p->password = $parts[4];
            return $p;
        } else {
            throw new InvalidArgumentException('Invalid proxy string format. Expected format: type:ip:port:login:password');
        }
    }

    public static function fromArray($proxyData): ?RemaskProxy
    {
        if (!$proxyData) {
            return null;
        }
        $p = new RemaskProxy();
        $p->type = $proxyData['type'];
        $p->ip = $proxyData['ip'];
        $p->port = $proxyData['port'];
        $p->login = $proxyData['login'];
        $p->password = $proxyData['password'];
        return $p;
    }

    public function AddToCurlOptions(array &$optArray): void
    {
        if (strtolower($this->type)==='http')
            $optArray[CURLOPT_PROXYTYPE] = 'HTTP';
        else
            $optArray[CURLOPT_PROXYTYPE] = CURLPROXY_SOCKS5;
        $optArray[CURLOPT_PROXY] = strtolower($this->type)==='http'?"http://".$this->ip:"socks5://".$this->ip;
        $optArray[CURLOPT_PROXYPORT] = $this->port;
        $optArray[CURLOPT_PROXYUSERPWD] = $this->login . ':' . $this->password;
    }
}