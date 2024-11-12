
<?php

require_once "config.php";

function openConnection()
{
    $config = getConfig();
    $conn = mysqli_connect(hostname: $config['MYSQL_HOST'], username: $config['MYSQL_USERNAME'], password: $config['MYSQL_PASSWORD'], database: $config['MYSQL_NAME']);
    // Check connection
    if (!$conn) {
        return die("Connection failed: " . mysqli_connect_error());
    }

    return $conn;
}
