package com.URLShortner.app.exception;

public class UrlGoneException extends RuntimeException{
    public UrlGoneException(String message){
        super(message);
    }
}
