package org.example.productshop.exception;

public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String message) {
        super(message);    // 呼叫RuntimeException的有參建構子
    }
}



