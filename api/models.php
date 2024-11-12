<?php

class Event
{
    static $maxTextLength = 128;
    static $maxDescLength = 512;
    static $categories = ["todo", "inprogress", "inreview", "done"];
    static $priorities = ["high", "medium", "low"];

    static function validateText($text)
    {
        if (!$text || !trim($text)) {
            return JSONResponse(["error" => "The task text can't be shorter than 1 character"]);
        }

        $maxLength = Event::$maxTextLength;
        if (strlen($text) > $maxLength) {
            return JSONResponse(["error" => "The task text can't be longer than {$maxLength} characters"]);
        }

        return $text;
    }

    static function validateDate($date)
    {
        if (!$date || !is_numeric(strtotime($date))) {
            return JSONResponse(["error" => "An unknown DATE format was received"]);
        }

        return $date;
    }

    static function validateTime($time)
    {
        if (!$time || !is_numeric(strtotime($time))) {
            return JSONResponse(["error" => "An unknown TIME format was received"]);
        }

        return $time;
    }
}
