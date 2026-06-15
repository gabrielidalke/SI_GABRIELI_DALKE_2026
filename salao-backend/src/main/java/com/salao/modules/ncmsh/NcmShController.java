package com.salao.modules.ncmsh;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ncm-sh")
@RequiredArgsConstructor
public class NcmShController {

    private final NcmShService service;

    @GetMapping
    public List<NcmShResponseDTO> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public NcmShResponseDTO buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NcmShResponseDTO criar(@RequestBody @Valid NcmShRequestDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public NcmShResponseDTO atualizar(@PathVariable Long id,
                                      @RequestBody @Valid NcmShRequestDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
