$url = "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
Write-Host "Buscando municípios do IBGE..."
$municipios = Invoke-RestMethod -Uri $url

Write-Host "Total: $($municipios.Count) municípios"

$output = @"
-- V16: Seed de todos os municípios brasileiros (IBGE)
-- Gerado automaticamente via API do IBGE

CREATE OR REPLACE FUNCTION seed_cidade_v16(p_nome VARCHAR, p_uf VARCHAR) RETURNS VOID AS `$`$
DECLARE
    v_estado_id BIGINT;
BEGIN
    SELECT id INTO v_estado_id FROM estados WHERE uf = p_uf;
    IF v_estado_id IS NOT NULL THEN
        INSERT INTO cidades (nome, ativo, estado_id)
        SELECT p_nome, true, v_estado_id
        WHERE NOT EXISTS (
            SELECT 1 FROM cidades WHERE nome = p_nome AND estado_id = v_estado_id
        );
    END IF;
END;
`$`$ LANGUAGE plpgsql;

"@

foreach ($m in $municipios) {
    $nome = $m.nome -replace "'", "''"
    $uf = $m.microrregiao.mesorregiao.UF.sigla
    $output += "SELECT seed_cidade_v16('$nome', '$uf');`n"
}

$output += "`nDROP FUNCTION seed_cidade_v16(VARCHAR, VARCHAR);`n"

$destino = "src\main\resources\db\migration\V16__seed_todas_cidades.sql"
$output | Out-File -FilePath $destino -Encoding utf8

Write-Host "Arquivo gerado: $destino"
Write-Host "Linhas: $((Get-Content $destino).Count)"
