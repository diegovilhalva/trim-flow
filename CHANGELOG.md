# Changelog - TrimFlow CRM Database

## [1.1] - 2024-01-13

### 🔧 Correções
- **CORRIGIDO**: Erro de ambiguidade na coluna `user_id` nas views
  - Especificado `c.user_id` na view `user_stats`
  - Melhorado JOIN na view `upcoming_appointments` para incluir validação de `user_id`
  - Adicionado `AND a.user_id = c.user_id` nos JOINs para maior segurança

### 📝 Melhorias
- **ADICIONADO**: Documentação sobre troubleshooting no README
- **MELHORADO**: JOINs nas views agora validam que appointments e clients pertencem ao mesmo usuário

### 🐛 Problemas Resolvidos
- Erro SQL: `column reference "user_id" is ambiguous` na linha 176

---

## [1.0] - 2024-01-13

### 🎉 Lançamento Inicial
- **CRIADO**: Script SQL completo para TrimFlow CRM
- **CRIADO**: Tabela `clients` com todos os campos solicitados
- **CRIADO**: Tabela `appointments` com relacionamentos
- **IMPLEMENTADO**: Row Level Security (RLS) completo
- **ADICIONADO**: Triggers automáticos para timestamps
- **CRIADO**: Views úteis para consultas comuns
- **DOCUMENTADO**: README completo com instruções