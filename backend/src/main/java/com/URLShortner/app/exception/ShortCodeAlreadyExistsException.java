package com.URLShortner.app.exception;

public class ShortCodeAlreadyExistsException extends RuntimeException{
    public ShortCodeAlreadyExistsException(String message){
        super(message);
    }
}
