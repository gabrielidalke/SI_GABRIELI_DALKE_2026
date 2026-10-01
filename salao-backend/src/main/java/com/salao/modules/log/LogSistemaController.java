package com.salao.modules.log;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogSistemaController {

    private final LogSistemaService service;

    @GetMapping
    public List<LogSistema> listar() {
        return service.recentes();
    }
}
