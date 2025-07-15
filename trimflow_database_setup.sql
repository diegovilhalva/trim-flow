-- ============================================================================
-- TrimFlow CRM - Instruções SQL para Supabase
-- Sistema de Gerenciamento de Barbearia
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: clients
-- Armazena informações dos clientes de cada barbeiro
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    last_visit DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);

-- ============================================================================
-- TABELA: appointments
-- Armazena os agendamentos de cada barbeiro
-- ============================================================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    service TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_date_time ON appointments(date, time);

-- ============================================================================
-- TRIGGERS para atualizar updated_at automaticamente
-- ============================================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para tabela clients
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela appointments
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- Garante que cada usuário só acesse seus próprios dados
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela clients
CREATE POLICY "Users can view their own clients" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" ON clients
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela appointments
CREATE POLICY "Users can view their own appointments" ON appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON appointments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" ON appointments
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- CONSTRAINTS ADICIONAIS
-- ============================================================================

-- Garantir que email seja único por usuário (se fornecido)
CREATE UNIQUE INDEX idx_clients_unique_email_per_user 
    ON clients(user_id, email) 
    WHERE email IS NOT NULL;

-- Garantir que não haja conflito de horários para o mesmo barbeiro
CREATE UNIQUE INDEX idx_appointments_unique_datetime_per_user 
    ON appointments(user_id, date, time);

-- ============================================================================
-- FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para atualizar last_visit automaticamente após novo agendamento
CREATE OR REPLACE FUNCTION update_client_last_visit()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE clients 
    SET last_visit = NEW.date 
    WHERE id = NEW.client_id 
    AND (last_visit IS NULL OR NEW.date > last_visit);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar last_visit
CREATE TRIGGER update_client_last_visit_trigger
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_client_last_visit();

-- ============================================================================
-- VIEWS ÚTEIS (opcional)
-- ============================================================================

-- View para próximos agendamentos
CREATE VIEW upcoming_appointments AS
SELECT 
    a.id,
    a.user_id,
    a.date,
    a.time,
    a.service,
    a.notes as appointment_notes,
    c.name as client_name,
    c.phone as client_phone,
    c.email as client_email,
    c.notes as client_notes
FROM appointments a
JOIN clients c ON a.client_id = c.id
WHERE a.date >= CURRENT_DATE
ORDER BY a.date, a.time;

-- View para estatísticas do barbeiro
CREATE VIEW user_stats AS
SELECT 
    user_id,
    COUNT(DISTINCT c.id) as total_clients,
    COUNT(a.id) as total_appointments,
    COUNT(CASE WHEN a.date >= CURRENT_DATE THEN 1 END) as upcoming_appointments,
    MAX(a.date) as last_appointment_date
FROM clients c
LEFT JOIN appointments a ON c.id = a.client_id
GROUP BY user_id;

-- ============================================================================
-- INSERÇÃO DE DADOS EXEMPLO (opcional - remover em produção)
-- ============================================================================

-- Exemplo de como inserir dados (substitua pelos valores reais)
/*
-- Inserir cliente
INSERT INTO clients (user_id, name, phone, email, notes) 
VALUES (
    'USER_UUID_AQUI', 
    'João Silva', 
    '(11) 99999-9999', 
    'joao@email.com', 
    'Cliente preferencial, corte degradê'
);

-- Inserir agendamento
INSERT INTO appointments (user_id, client_id, date, time, service, notes)
VALUES (
    'USER_UUID_AQUI',
    'CLIENT_UUID_AQUI', 
    '2024-01-15', 
    '14:30', 
    'Corte + Barba', 
    'Cliente pediu para não usar máquina 0'
);
*/

-- ============================================================================
-- COMANDOS PARA VERIFICAÇÃO
-- ============================================================================

-- Verificar estrutura das tabelas
-- \d clients
-- \d appointments

-- Verificar políticas RLS
-- SELECT * FROM pg_policies WHERE tablename IN ('clients', 'appointments');

-- Verificar índices
-- SELECT * FROM pg_indexes WHERE tablename IN ('clients', 'appointments');