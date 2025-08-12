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
        e.printStackTrace();
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
                .body("server error"+e.getMessage());
    }

    //-----加入購物車------

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "RUNTIME_ERROR");
        response.put("message", "執行期間發生錯誤");
        return ResponseEntity.status(500).body(response);
    }

    //------搜尋商品------------

    // 查無結果 → 404，照你規格回 JSON
    @ExceptionHandler(NoResultsException.class)
    public ResponseEntity<?> handleNoResults(NoResultsException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NO_RESULTS", "message", ex.getMessage()));
    }

    // 參數不合法（空字串、全是空白…）→ 400
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "BAD_REQUEST", "message", ex.getMessage()));
    }
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<?> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(405).body(Map.of(
                "error", "METHOD_NOT_ALLOWED",
                "message", "此路徑不支援 " + ex.getMethod() + "，請改用 GET"
        ));
    }

    //刪除購物車商品
    public ResponseEntity<?> handleCartItemNotFound(Exception e) {
        return ResponseEntity.status(404).body(Map.of(
                "error", "ITEM_NOT_FOUND",
                "message", "購物車中沒有此商品"
        ));
    }
}
