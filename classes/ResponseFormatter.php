<?php

class ResponseFormatter
{
    public static function Respond(array $resp): void
    {
        ob_start("ob_gzhandler");
        http_response_code(200);
        header("Content-Type: application/json");
        if (!$resp['res'])
            $json = json_encode($resp);
        else {
            $json = json_decode($resp['res']);
            $json = json_encode($json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        }
        echo $json;
        ob_flush();
    }

    public static function ResponseHasError(array $resp):bool
    {
        return str_contains($resp['res'], '"error":');
    }
}