package com.salao.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return resposta(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return resposta(HttpStatus.BAD_REQUEST, mensagem.isBlank() ? "Dados inválidos." : mensagem);
    }

    // Chave duplicada ou registro ainda vinculado a outros dados (a regra de negócio é checada antes,
    // isto é a rede de segurança do banco, inclusive para duas requisições simultâneas)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleIntegridade(DataIntegrityViolationException ex) {
        String causa = ex.getMostSpecificCause().getMessage();
        String texto = causa != null ? causa.toLowerCase() : "";
        if (texto.contains("duplicate key") || texto.contains("unique"))
            return resposta(HttpStatus.CONFLICT, "Já existe um registro com estes dados.");
        if (texto.contains("foreign key"))
            return resposta(HttpStatus.CONFLICT, "Operação não permitida: o registro está vinculado a outros cadastros.");
        if (texto.contains("out of range") || texto.contains("numeric field overflow"))
            return resposta(HttpStatus.BAD_REQUEST, "Algum valor numérico informado é grande demais.");
        return resposta(HttpStatus.CONFLICT, "Não foi possível salvar: os dados violam uma regra do banco de dados.");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleJsonInvalido(HttpMessageNotReadableException ex) {
        return resposta(HttpStatus.BAD_REQUEST, "Dados inválidos: confira os campos (datas no formato AAAA-MM-DD e números sem letras).");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTipoInvalido(MethodArgumentTypeMismatchException ex) {
        return resposta(HttpStatus.BAD_REQUEST, "Parâmetro inválido: " + ex.getName() + ".");
    }

    private ResponseEntity<Map<String, String>> resposta(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of("mensagem", mensagem != null ? mensagem : "Erro inesperado."));
    }
}
