<?php

require_once '../controller.php';
require_once '../utils.php';
require_once '../db.php';
require_once '../models.php';

class EventsRouteController extends RouteController
{
    function get()
    {
        if (array_key_exists("id", array: $_GET)) {
            return $this->getById($_GET["id"]);
        }

        return $this->getAll();
    }

    function getAll()
    {
        $conn = openConnection();
        $result = mysqli_query($conn, "SELECT * FROM `events`");
        $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_close($conn);

        return JSONResponse($data, 200);
    }

    function getById($id)
    {
        if (!is_numeric($id)) {
            return JSONResponse(["error" => "Event not found"], 404);
        }

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "SELECT * FROM `events` WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "d", $id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);
        if (!$data) {
            return JSONResponse(["error" => "Event not found"], 404);
        }

        return JSONResponse($data[0], 200);
    }

    function post()
    {
        $body = $this->getJSONBody();
        $requiredKeys =  ["date", "text", "start_time", "end_time"];
        validateBody($body, $requiredKeys);
        $eventDate = $body->date;
        $eventText = $body->text;
        $eventStartTime = $body->start_time;
        $eventEndTime = $body->end_time;

        Event::validateDate($eventDate);
        Event::validateText($eventText);
        Event::validateTime($eventStartTime);
        Event::validateTime($eventEndTime);

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "INSERT INTO `events` (`date`, `text`, `start_time`, `end_time`) VALUES (?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "ssss", $eventDate, $eventText, $eventStartTime, $eventEndTime);
        mysqli_stmt_execute($stmt);

        $lastId = mysqli_insert_id($conn);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        return $this->getById($lastId);
    }

    function patch()
    {
        if (!array_key_exists("id", array: $_GET) || !is_numeric($_GET["id"])) {
            return JSONResponse(["error" => "Event not found"], 404);
        }

        $id = $_GET["id"];

        $body = $this->getJSONBody();
        $requiredKeys = ["text"];
        validateBody($body, $requiredKeys);
        $eventText = $body->text;

        Event::validateText($eventText);

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "UPDATE `events` SET `text` = ? WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "sd", $eventText, $id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        return $this->getById($id);
    }

    function delete()
    {
        if (!array_key_exists("id", array: $_GET) || !is_numeric($_GET["id"])) {
            return JSONResponse(["error" => "Event not found"], 404);
        }

        $id = $_GET["id"];

        $conn = openConnection();
        $stmt = mysqli_prepare($conn, "DELETE FROM `events` WHERE `id` = ?");
        mysqli_stmt_bind_param($stmt, "d", $id);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        mysqli_close($conn);

        return JSONResponse(["result" => "success"], 200);
    }
}

$routeController = new EventsRouteController;
$routeController->init();
