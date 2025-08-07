package org.example.productshop.exception;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<String> handleDuplicateKey(DuplicateKeyException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("註冊失敗：email 已被註冊");
    }

    @ExceptionHandler(BadSqlGrammarException.class)
    public ResponseEntity<String> handleBadSql(BadSqlGrammarException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("資料庫錯誤，可能是欄位不存在或SQL錯誤");
    }




    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleOtherErrors(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("server error");
    }

    //-----加入購物車------
    @ExceptionHandler(OutOfStockException.class)
    public ResponseEntity<?> handleOutOfStock(OutOfStockException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "OUT_OF_STOCK");
        response.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<?> handleProductNotFound(ProductNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "NOT_FOUND");
        response.put("message", ex.getMessage());
        return ResponseEntity.status(404).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        ex.printStackTrace(); // 或log.error("Exception: ", ex)
        Map<String, String> response = new HashMap<>();
        response.put("error", "RUNTIME_ERROR");
        response.put("message", "執行期間發生錯誤");
        return ResponseEntity.status(500).body(response);
    }
}
