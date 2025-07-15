# 🚀 Configuração do Supabase para TrimFlow CRM

Este guia explica como configurar o Supabase para funcionar com o sistema TrimFlow CRM que você acabou de implementar.

## 📋 Pré-requisitos

- Conta no [Supabase](https://app.supabase.com)
- Projeto TrimFlow clonado/baixado
- Node.js instalado

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Escolha sua organização
4. Defina:
   - **Nome**: `TrimFlow CRM`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a mais próxima dos seus usuários
5. Clique em **"Create new project"**
6. Aguarde a criação (pode levar alguns minutos)

### 2. Configurar o Banco de Dados

1. No dashboard do projeto, vá para **SQL Editor**
2. Copie todo o conteúdo do arquivo `trimflow_database_setup.sql`
3. Cole no editor SQL
4. Clique em **"Run"** para executar
5. Verifique se não há erros (deve aparecer "Success. No rows returned")

### 3. Obter Chaves de API

1. Vá para **Settings** → **API**
2. Copie os seguintes valores:
   - **Project URL** (em "Project URL")
   - **anon public** (em "Project API keys")

### 4. Configurar Variáveis de Ambiente

1. Na pasta do projeto TrimFlow, crie um arquivo `.env.local`
2. Adicione as configurações:

```env
# Substitua pelos valores do seu projeto
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_key_aqui
```

### 5. Configurar Autenticação

1. No Supabase, vá para **Authentication** → **Settings**
2. Em **"Site URL"**, adicione:
   - Para desenvolvimento: `http://localhost:3000`
   - Para produção: `https://seudominio.com`
3. Em **"Redirect URLs"**, adicione:
   - Para desenvolvimento: `http://localhost:3000/**`
   - Para produção: `https://seudominio.com/**`

### 6. Testar a Configuração

1. Inicie o projeto:
```bash
pnpm dev
```

2. Acesse `http://localhost:3000/register`
3. Crie uma conta de teste
4. Verifique se:
   - ✅ O cadastro funciona
   - ✅ Você recebe email de confirmação
   - ✅ O login funciona após confirmar email
   - ✅ É redirecionado para o dashboard
   - ✅ O logout funciona

## 🔒 Configurações de Segurança (Opcional)

### Email Templates (Recomendado)

1. Vá para **Authentication** → **Email Templates**
2. Customize os templates para:
   - **Confirm signup**: Email de confirmação de cadastro
   - **Magic Link**: Login sem senha (se habilitado)
   - **Change Email Address**: Mudança de email
   - **Reset Password**: Recuperação de senha

### Row Level Security (Já Configurado)

O script SQL já configurou RLS para garantir que:
- Cada barbeiro só vê seus próprios clientes
- Cada barbeiro só vê seus próprios agendamentos
- Não há vazamento de dados entre usuários

### Políticas Adicionais (Opcional)

Se quiser adicionar mais segurança:

```sql
-- Limitar cadastros por hora por IP
CREATE POLICY "rate_limit_signups" ON auth.users 
FOR INSERT 
WITH CHECK (
  (SELECT COUNT(*) FROM auth.users 
   WHERE created_at > NOW() - INTERVAL '1 hour'
   AND raw_user_meta_data->>'ip_address' = auth.jwt()->>'ip_address'
  ) < 5
);
```

## 🚨 Troubleshooting

### Erro: "Invalid Project URL"
- Verifique se a URL no `.env.local` está correta
- Certifique-se de que não há espaços extras

### Erro: "Invalid API Key"
- Verifique se a chave anon está correta
- Use a chave **anon public**, não a **service_role**

### Erro: "Email not confirmed"
- Verifique a pasta de spam
- Configure SMTP personalizado em **Settings** → **Auth** → **SMTP Settings**

### Cadastro não funciona
- Verifique se RLS está ativo nas tabelas
- Confirme que as políticas foram criadas corretamente

### Login não redireciona
- Verifique as URLs de redirect nas configurações de auth
- Confirme que o hook `useAuth` está funcionando

## 📱 Próximos Passos

Após a configuração, você pode:

1. **Customizar emails**: Personalize os templates de email
2. **Configurar domínio personalizado**: Para emails profissionais
3. **Habilitar provedores OAuth**: Google, GitHub, etc.
4. **Configurar webhooks**: Para integrações externas
5. **Implementar backup**: Configurar backups automáticos

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://app.supabase.com)
- [Comunidade Supabase](https://github.com/supabase/supabase/discussions)

---

**✨ Configuração concluída!** Seu TrimFlow CRM está pronto para uso com autenticação segura via Supabase.