<?php
session_start();
require_once 'settings.php';

// Check if the password is provided in the query string
if (isset($_GET['password'])) {
    // If the password matches the global password, store it in the session
    if ($_GET['password'] === PASSWORD) {
        $_SESSION['password'] = PASSWORD;
    } else {
        // Redirect the user to the login page or show an error message
        die('Password does not match!');
        exit();
    }
} elseif (!isset($_SESSION['password'])) {
    die('No password given!');
    exit();
}
