<?php
require_once 'utils.php';

class RouteController
{
    function getJSONBody()
    {
        if (!array_key_exists("HTTP_CONTENT_TYPE", $_SERVER) || $_SERVER["HTTP_CONTENT_TYPE"] !== "application/json") {
            return $this->notFound();
        }

        return json_decode(file_get_contents(filename: "php://input"));
    }

    public function init()
    {
        switch ($_SERVER["REQUEST_METHOD"]) {
            case "GET":
                $this->get();
                break;
            case "POST":
                $this->post();
                break;
            case "PATCH":
                $this->patch();
                break;
            case "PUT":
                $this->put();
                break;
            case "DELETE":
                $this->delete();
                break;
            default:
                $this->notFound();
                break;
        }
    }

    function notFound()
    {
        return JSONResponse(["detail" => "Route not found :("], 404);
    }

    function get()
    {
        return $this->notFound();
    }

    function post()
    {
        return $this->notFound();
    }

    function patch()
    {
        return $this->notFound();
    }

    function put()
    {
        return $this->notFound();
    }

    function delete()
    {
        return $this->notFound();
    }
}
