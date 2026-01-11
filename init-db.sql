-- Script de inicialização do banco de dados
-- Este script é executado automaticamente quando o container PostgreSQL é criado pela primeira vez

-- O banco de dados e usuário já são criados automaticamente pelas variáveis de ambiente
-- Este arquivo pode ser usado para configurações adicionais se necessário

-- Garantir que o usuário tem todas as permissões
GRANT ALL PRIVILEGES ON DATABASE autodoc TO autodoc;
