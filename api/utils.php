<?php

function JSONResponse($data, $statusCode = 400)
{
    header("Content-type: application/json; charset=utf-8");
    http_response_code($statusCode);
    echo json_encode($data, JSON_NUMERIC_CHECK);
    exit();
}

function validateBody($body, $requiredKeys)
{
    foreach ($requiredKeys as $key => $value) {
        if (!property_exists($body, $value)) {
            return JSONResponse(["error" => "You didn't pass a '{$value}' field"]);
        }
    }
}
