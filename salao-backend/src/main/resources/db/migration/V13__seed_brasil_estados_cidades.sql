-- Insere Brasil (se não existir)
INSERT INTO paises (nome, sigla, moeda, ativo)
SELECT 'Brasil', 'BRA', 'Real', true
WHERE NOT EXISTS (SELECT 1 FROM paises WHERE sigla = 'BRA');

-- Insere todos os estados brasileiros (uf tem UNIQUE constraint)
DO $$
DECLARE
    brasil_id BIGINT;
BEGIN
    SELECT id INTO brasil_id FROM paises WHERE sigla = 'BRA';

    INSERT INTO estados (nome, uf, ativo, pais_id) VALUES
        ('Acre',                'AC', true, brasil_id),
        ('Alagoas',             'AL', true, brasil_id),
        ('Amapá',               'AP', true, brasil_id),
        ('Amazonas',            'AM', true, brasil_id),
        ('Bahia',               'BA', true, brasil_id),
        ('Ceará',               'CE', true, brasil_id),
        ('Distrito Federal',    'DF', true, brasil_id),
        ('Espírito Santo',      'ES', true, brasil_id),
        ('Goiás',               'GO', true, brasil_id),
        ('Maranhão',            'MA', true, brasil_id),
        ('Mato Grosso',         'MT', true, brasil_id),
        ('Mato Grosso do Sul',  'MS', true, brasil_id),
        ('Minas Gerais',        'MG', true, brasil_id),
        ('Pará',                'PA', true, brasil_id),
        ('Paraíba',             'PB', true, brasil_id),
        ('Paraná',              'PR', true, brasil_id),
        ('Pernambuco',          'PE', true, brasil_id),
        ('Piauí',               'PI', true, brasil_id),
        ('Rio de Janeiro',      'RJ', true, brasil_id),
        ('Rio Grande do Norte', 'RN', true, brasil_id),
        ('Rio Grande do Sul',   'RS', true, brasil_id),
        ('Rondônia',            'RO', true, brasil_id),
        ('Roraima',             'RR', true, brasil_id),
        ('Santa Catarina',      'SC', true, brasil_id),
        ('São Paulo',           'SP', true, brasil_id),
        ('Sergipe',             'SE', true, brasil_id),
        ('Tocantins',           'TO', true, brasil_id)
    ON CONFLICT (uf) DO NOTHING;
END;
$$;

-- Helper: insere cidade apenas se ainda não existe naquele estado
CREATE OR REPLACE FUNCTION seed_cidade(p_nome VARCHAR, p_uf VARCHAR) RETURNS VOID AS $$
DECLARE
    v_estado_id BIGINT;
BEGIN
    SELECT id INTO v_estado_id FROM estados WHERE uf = p_uf;
    INSERT INTO cidades (nome, ativo, estado_id)
    SELECT p_nome, true, v_estado_id
    WHERE NOT EXISTS (
        SELECT 1 FROM cidades WHERE nome = p_nome AND estado_id = v_estado_id
    );
END;
$$ LANGUAGE plpgsql;

-- Acre
SELECT seed_cidade('Rio Branco', 'AC');
SELECT seed_cidade('Cruzeiro do Sul', 'AC');
SELECT seed_cidade('Sena Madureira', 'AC');

-- Alagoas
SELECT seed_cidade('Maceió', 'AL');
SELECT seed_cidade('Arapiraca', 'AL');
SELECT seed_cidade('Palmeira dos Índios', 'AL');
SELECT seed_cidade('Rio Largo', 'AL');

-- Amapá
SELECT seed_cidade('Macapá', 'AP');
SELECT seed_cidade('Santana', 'AP');
SELECT seed_cidade('Laranjal do Jari', 'AP');

-- Amazonas
SELECT seed_cidade('Manaus', 'AM');
SELECT seed_cidade('Parintins', 'AM');
SELECT seed_cidade('Itacoatiara', 'AM');
SELECT seed_cidade('Manacapuru', 'AM');

-- Bahia
SELECT seed_cidade('Salvador', 'BA');
SELECT seed_cidade('Feira de Santana', 'BA');
SELECT seed_cidade('Vitória da Conquista', 'BA');
SELECT seed_cidade('Camaçari', 'BA');
SELECT seed_cidade('Juazeiro', 'BA');
SELECT seed_cidade('Ilhéus', 'BA');
SELECT seed_cidade('Lauro de Freitas', 'BA');
SELECT seed_cidade('Barreiras', 'BA');

-- Ceará
SELECT seed_cidade('Fortaleza', 'CE');
SELECT seed_cidade('Caucaia', 'CE');
SELECT seed_cidade('Juazeiro do Norte', 'CE');
SELECT seed_cidade('Maracanaú', 'CE');
SELECT seed_cidade('Sobral', 'CE');
SELECT seed_cidade('Crato', 'CE');

-- Distrito Federal
SELECT seed_cidade('Brasília', 'DF');
SELECT seed_cidade('Taguatinga', 'DF');
SELECT seed_cidade('Ceilândia', 'DF');
SELECT seed_cidade('Samambaia', 'DF');

-- Espírito Santo
SELECT seed_cidade('Vitória', 'ES');
SELECT seed_cidade('Serra', 'ES');
SELECT seed_cidade('Vila Velha', 'ES');
SELECT seed_cidade('Cariacica', 'ES');
SELECT seed_cidade('Cachoeiro de Itapemirim', 'ES');
SELECT seed_cidade('Linhares', 'ES');

-- Goiás
SELECT seed_cidade('Goiânia', 'GO');
SELECT seed_cidade('Aparecida de Goiânia', 'GO');
SELECT seed_cidade('Anápolis', 'GO');
SELECT seed_cidade('Rio Verde', 'GO');
SELECT seed_cidade('Luziânia', 'GO');
SELECT seed_cidade('Águas Lindas de Goiás', 'GO');

-- Maranhão
SELECT seed_cidade('São Luís', 'MA');
SELECT seed_cidade('Imperatriz', 'MA');
SELECT seed_cidade('São José de Ribamar', 'MA');
SELECT seed_cidade('Timon', 'MA');
SELECT seed_cidade('Caxias', 'MA');

-- Mato Grosso
SELECT seed_cidade('Cuiabá', 'MT');
SELECT seed_cidade('Várzea Grande', 'MT');
SELECT seed_cidade('Rondonópolis', 'MT');
SELECT seed_cidade('Sinop', 'MT');
SELECT seed_cidade('Tangará da Serra', 'MT');

-- Mato Grosso do Sul
SELECT seed_cidade('Campo Grande', 'MS');
SELECT seed_cidade('Dourados', 'MS');
SELECT seed_cidade('Três Lagoas', 'MS');
SELECT seed_cidade('Corumbá', 'MS');

-- Minas Gerais
SELECT seed_cidade('Belo Horizonte', 'MG');
SELECT seed_cidade('Uberlândia', 'MG');
SELECT seed_cidade('Contagem', 'MG');
SELECT seed_cidade('Juiz de Fora', 'MG');
SELECT seed_cidade('Betim', 'MG');
SELECT seed_cidade('Montes Claros', 'MG');
SELECT seed_cidade('Uberaba', 'MG');
SELECT seed_cidade('Ribeirão das Neves', 'MG');
SELECT seed_cidade('Governador Valadares', 'MG');
SELECT seed_cidade('Ipatinga', 'MG');

-- Pará
SELECT seed_cidade('Belém', 'PA');
SELECT seed_cidade('Ananindeua', 'PA');
SELECT seed_cidade('Santarém', 'PA');
SELECT seed_cidade('Marabá', 'PA');
SELECT seed_cidade('Castanhal', 'PA');
SELECT seed_cidade('Parauapebas', 'PA');

-- Paraíba
SELECT seed_cidade('João Pessoa', 'PB');
SELECT seed_cidade('Campina Grande', 'PB');
SELECT seed_cidade('Santa Rita', 'PB');
SELECT seed_cidade('Patos', 'PB');
SELECT seed_cidade('Bayeux', 'PB');

-- Paraná
SELECT seed_cidade('Curitiba', 'PR');
SELECT seed_cidade('Londrina', 'PR');
SELECT seed_cidade('Maringá', 'PR');
SELECT seed_cidade('Ponta Grossa', 'PR');
SELECT seed_cidade('Cascavel', 'PR');
SELECT seed_cidade('São José dos Pinhais', 'PR');
SELECT seed_cidade('Foz do Iguaçu', 'PR');
SELECT seed_cidade('Colombo', 'PR');
SELECT seed_cidade('Guarapuava', 'PR');
SELECT seed_cidade('Paranaguá', 'PR');
SELECT seed_cidade('Araucária', 'PR');
SELECT seed_cidade('Toledo', 'PR');
SELECT seed_cidade('Apucarana', 'PR');
SELECT seed_cidade('Campo Largo', 'PR');
SELECT seed_cidade('Pinhais', 'PR');
SELECT seed_cidade('Francisco Beltrão', 'PR');

-- Pernambuco
SELECT seed_cidade('Recife', 'PE');
SELECT seed_cidade('Caruaru', 'PE');
SELECT seed_cidade('Olinda', 'PE');
SELECT seed_cidade('Petrolina', 'PE');
SELECT seed_cidade('Paulista', 'PE');
SELECT seed_cidade('Jaboatão dos Guararapes', 'PE');

-- Piauí
SELECT seed_cidade('Teresina', 'PI');
SELECT seed_cidade('Parnaíba', 'PI');
SELECT seed_cidade('Picos', 'PI');
SELECT seed_cidade('Floriano', 'PI');

-- Rio de Janeiro
SELECT seed_cidade('Rio de Janeiro', 'RJ');
SELECT seed_cidade('São Gonçalo', 'RJ');
SELECT seed_cidade('Duque de Caxias', 'RJ');
SELECT seed_cidade('Nova Iguaçu', 'RJ');
SELECT seed_cidade('Niterói', 'RJ');
SELECT seed_cidade('Belford Roxo', 'RJ');
SELECT seed_cidade('São João de Meriti', 'RJ');
SELECT seed_cidade('Petrópolis', 'RJ');
SELECT seed_cidade('Volta Redonda', 'RJ');
SELECT seed_cidade('Macaé', 'RJ');

-- Rio Grande do Norte
SELECT seed_cidade('Natal', 'RN');
SELECT seed_cidade('Mossoró', 'RN');
SELECT seed_cidade('Parnamirim', 'RN');
SELECT seed_cidade('São Gonçalo do Amarante', 'RN');

-- Rio Grande do Sul
SELECT seed_cidade('Porto Alegre', 'RS');
SELECT seed_cidade('Caxias do Sul', 'RS');
SELECT seed_cidade('Canoas', 'RS');
SELECT seed_cidade('Pelotas', 'RS');
SELECT seed_cidade('Santa Maria', 'RS');
SELECT seed_cidade('Gravataí', 'RS');
SELECT seed_cidade('Viamão', 'RS');
SELECT seed_cidade('Novo Hamburgo', 'RS');
SELECT seed_cidade('São Leopoldo', 'RS');
SELECT seed_cidade('Rio Grande', 'RS');
SELECT seed_cidade('Alvorada', 'RS');
SELECT seed_cidade('Passo Fundo', 'RS');

-- Rondônia
SELECT seed_cidade('Porto Velho', 'RO');
SELECT seed_cidade('Ji-Paraná', 'RO');
SELECT seed_cidade('Ariquemes', 'RO');
SELECT seed_cidade('Vilhena', 'RO');

-- Roraima
SELECT seed_cidade('Boa Vista', 'RR');
SELECT seed_cidade('Caracaraí', 'RR');
SELECT seed_cidade('Rorainópolis', 'RR');

-- Santa Catarina
SELECT seed_cidade('Joinville', 'SC');
SELECT seed_cidade('Florianópolis', 'SC');
SELECT seed_cidade('Blumenau', 'SC');
SELECT seed_cidade('São José', 'SC');
SELECT seed_cidade('Criciúma', 'SC');
SELECT seed_cidade('Chapecó', 'SC');
SELECT seed_cidade('Itajaí', 'SC');
SELECT seed_cidade('Lages', 'SC');
SELECT seed_cidade('Jaraguá do Sul', 'SC');
SELECT seed_cidade('Palhoça', 'SC');

-- São Paulo
SELECT seed_cidade('São Paulo', 'SP');
SELECT seed_cidade('Guarulhos', 'SP');
SELECT seed_cidade('Campinas', 'SP');
SELECT seed_cidade('São Bernardo do Campo', 'SP');
SELECT seed_cidade('Santo André', 'SP');
SELECT seed_cidade('Osasco', 'SP');
SELECT seed_cidade('Ribeirão Preto', 'SP');
SELECT seed_cidade('Sorocaba', 'SP');
SELECT seed_cidade('Mauá', 'SP');
SELECT seed_cidade('São José dos Campos', 'SP');
SELECT seed_cidade('Santos', 'SP');
SELECT seed_cidade('Mogi das Cruzes', 'SP');
SELECT seed_cidade('Diadema', 'SP');
SELECT seed_cidade('Jundiaí', 'SP');
SELECT seed_cidade('Carapicuíba', 'SP');
SELECT seed_cidade('Piracicaba', 'SP');
SELECT seed_cidade('Bauru', 'SP');
SELECT seed_cidade('São José do Rio Preto', 'SP');
SELECT seed_cidade('Franca', 'SP');
SELECT seed_cidade('Limeira', 'SP');

-- Sergipe
SELECT seed_cidade('Aracaju', 'SE');
SELECT seed_cidade('Nossa Senhora do Socorro', 'SE');
SELECT seed_cidade('Lagarto', 'SE');
SELECT seed_cidade('Itabaiana', 'SE');

-- Tocantins
SELECT seed_cidade('Palmas', 'TO');
SELECT seed_cidade('Araguaína', 'TO');
SELECT seed_cidade('Gurupi', 'TO');
SELECT seed_cidade('Porto Nacional', 'TO');

-- Remove a função auxiliar após o uso
DROP FUNCTION seed_cidade(VARCHAR, VARCHAR);
