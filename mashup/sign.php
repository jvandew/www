<?php

/* This is insecure and should be passed over HTTPS or stored directly. */
$token_secret = $_POST[token];
$consumer_secret = rawurlencode("wogw4ITaX0BPPGo8FyvTOmsVGhyzC7qawt9lEQT8V4");
$key = $consumer_secret + "&" + $token_secret;
$base = $_POST[base];

$sig = base64_encode(hash_hmac("sha1", $base, $key, true));
echo $sig;

?>