package org.example.productshop.exception;

public class CartEmptyException extends RuntimeException {
    public CartEmptyException(String msg) {super(msg);}
}
