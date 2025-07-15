# TrimFlow CRM - Setup do Banco de Dados

Este documento contém as instruções completas para configurar o banco de dados do **TrimFlow**, um sistema CRM específico para barbearias usando Supabase.

## 📋 Visão Geral

O TrimFlow é um sistema de gerenciamento de relacionamento com clientes (CRM) projetado especificamente para barbearias. O sistema permite que múltiplos barbeiros gerenciem seus próprios clientes e agendamentos de forma independente e segura.

## 🏗️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `clients` - Clientes
- **id**: UUID (chave primária, gerada automaticamente)
- **user_id**: UUID (referência para auth.users do Supabase)
- **name**: Texto (obrigatório) - Nome do cliente
- **phone**: Texto (opcional) - Telefone do cliente
- **email**: Texto (opcional) - Email do cliente
- **last_visit**: Data (opcional) - Data da última visita
- **notes**: Texto (opcional) - Observações sobre o cliente
- **created_at**: Timestamp - Data de criação
- **updated_at**: Timestamp - Data da última atualização

#### 2. `appointments` - Agendamentos
- **id**: UUID (chave primária, gerada automaticamente)
- **user_id**: UUID (referência para auth.users do Supabase)
- **client_id**: UUID (referência para clients)
- **date**: Data (obrigatório) - Data do agendamento
- **time**: Hora (obrigatório) - Horário do agendamento
- **service**: Texto (obrigatório) - Serviço a ser realizado
- **notes**: Texto (opcional) - Observações sobre o agendamento
- **created_at**: Timestamp - Data de criação
- **updated_at**: Timestamp - Data da última atualização

## 🚀 Como Implementar no Supabase

### Passo 1: Acessar o SQL Editor
1. Faça login no [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para a seção **SQL Editor** no menu lateral

### Passo 2: Executar o Script SQL
1. Abra o arquivo `trimflow_database_setup.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar o script

### Passo 3: Verificar a Implementação
Após executar o script, você pode verificar se tudo foi criado corretamente:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'appointments');

-- Verificar políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('clients', 'appointments');
```

## 🔒 Segurança e Isolamento de Dados

### Row Level Security (RLS)
O sistema implementa RLS para garantir que:
- Cada barbeiro só vê seus próprios clientes
- Cada barbeiro só vê seus próprios agendamentos
- Não há vazamento de dados entre usuários

### Políticas Implementadas
- **SELECT**: Usuários só podem visualizar seus próprios registros
- **INSERT**: Usuários só podem inserir registros vinculados ao seu ID
- **UPDATE**: Usuários só podem atualizar seus próprios registros
- **DELETE**: Usuários só podem deletar seus próprios registros

## 📊 Funcionalidades Automáticas

### 1. Atualização Automática de Timestamps
- Campos `updated_at` são atualizados automaticamente a cada modificação
- Implementado via triggers PostgreSQL

### 2. Atualização da Última Visita
- O campo `last_visit` do cliente é atualizado automaticamente quando um novo agendamento é criado
- Garante que a data da última visita esteja sempre atualizada

### 3. Prevenção de Conflitos
- **Emails únicos**: Um barbeiro não pode ter dois clientes com o mesmo email
- **Horários únicos**: Um barbeiro não pode ter dois agendamentos no mesmo horário

## 📈 Views Úteis

### `upcoming_appointments`
Mostra todos os próximos agendamentos com informações dos clientes:
```sql
SELECT * FROM upcoming_appointments WHERE user_id = 'seu_user_id';
```

### `user_stats`
Fornece estatísticas básicas para cada barbeiro:
```sql
SELECT * FROM user_stats WHERE user_id = 'seu_user_id';
```

## 💡 Exemplos de Uso

### Inserir um Cliente
```sql
INSERT INTO clients (user_id, name, phone, email, notes) 
VALUES (
    auth.uid(), -- Automaticamente pega o ID do usuário logado
    'João Silva', 
    '(11) 99999-9999', 
    'joao@email.com', 
    'Cliente preferencial, gosta de corte degradê'
);
```

### Inserir um Agendamento
```sql
INSERT INTO appointments (user_id, client_id, date, time, service, notes)
VALUES (
    auth.uid(), -- Automaticamente pega o ID do usuário logado
    'uuid_do_cliente', 
    '2024-01-15', 
    '14:30', 
    'Corte + Barba', 
    'Cliente pediu para não usar máquina 0'
);
```

### Buscar Agendamentos do Dia
```sql
SELECT 
    a.time,
    c.name as cliente,
    a.service,
    a.notes
FROM appointments a
JOIN clients c ON a.client_id = c.id
WHERE a.user_id = auth.uid()
AND a.date = CURRENT_DATE
ORDER BY a.time;
```

## 🔧 Manutenção e Otimização

### Índices Criados
O script cria índices para otimizar as consultas mais comuns:
- Busca por barbeiro (`user_id`)
- Busca por nome de cliente
- Busca por telefone e email
- Busca por data de agendamento

### Backup Recomendado
Para backup regular dos dados:
```sql
-- Backup dos clientes
COPY (SELECT * FROM clients WHERE user_id = 'seu_user_id') TO 'clients_backup.csv' CSV HEADER;

-- Backup dos agendamentos
COPY (SELECT * FROM appointments WHERE user_id = 'seu_user_id') TO 'appointments_backup.csv' CSV HEADER;
```

## 🆘 Troubleshooting

### Erro de Permissão
Se você receber erros de permissão, verifique se:
1. O usuário está autenticado
2. As políticas RLS estão ativas
3. O `user_id` está sendo passado corretamente

### Erro de Chave Estrangeira
Para agendamentos, certifique-se de que:
1. O `client_id` existe na tabela `clients`
2. O `client_id` pertence ao mesmo `user_id`

### Performance Lenta
Se as consultas estiverem lentas:
1. Verifique se os índices foram criados
2. Use `EXPLAIN ANALYZE` para identificar gargalos
3. Considere adicionar índices específicos para suas consultas

## 📞 Próximos Passos

Após implementar o banco de dados, você pode:
1. Configurar a autenticação no frontend
2. Implementar as operações CRUD
3. Criar dashboards para visualização
4. Implementar notificações de agendamento
5. Adicionar relatórios de faturamento

---

**TrimFlow CRM** - Desenvolvido para barbearias modernas 💈