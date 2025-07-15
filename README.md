# 💈 TrimFlow CRM - Sistema de Gerenciamento para Barbearias

Um sistema CRM completo e moderno desenvolvido especificamente para barbearias, com autenticação segura via Supabase e interface otimizada para múltiplos barbeiros.

## ✨ Funcionalidades

- 🔐 **Autenticação Completa**: Login, cadastro e recuperação de senha
- 👥 **Multi-usuário**: Cada barbeiro gerencia seus próprios clientes
- 📅 **Agendamentos**: Sistema completo de agendamentos
- 🗃️ **Gestão de Clientes**: Cadastro e histórico de clientes
- 🔒 **Segurança Avançada**: Row Level Security (RLS) com Supabase
- 📱 **Design Responsivo**: Interface otimizada para desktop e mobile
- 🎨 **UI Moderna**: Componentes shadcn/ui com Tailwind CSS

## 🚀 Configuração Rápida

### 1. Clonar e Instalar
```bash
git clone <seu-repositorio>
cd trimflow-crm
pnpm install
```

### 2. Configurar Supabase
1. Siga o guia completo em [`SETUP_SUPABASE.md`](./SETUP_SUPABASE.md)
2. Execute o script SQL em [`trimflow_database_setup.sql`](./trimflow_database_setup.sql)
3. Configure as variáveis de ambiente

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
```

### 4. Iniciar o Projeto
```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) e comece a usar!

## 🏗️ Arquitetura

### Frontend
- **Next.js 15** com App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Sonner** para notificações toast

### Backend & Banco
- **Supabase** para autenticação e banco de dados
- **PostgreSQL** com Row Level Security
- **Políticas RLS** para isolamento de dados
- **Triggers automáticos** para manutenção de dados

### Estrutura de Pastas
```
├── app/                 # Páginas do Next.js (App Router)
│   ├── login/          # Página de login
│   ├── register/       # Página de cadastro
│   └── page.tsx        # Dashboard principal
├── components/         # Componentes reutilizáveis
│   ├── auth/          # Componentes de autenticação
│   └── ui/            # Componentes shadcn/ui
├── hooks/             # Hooks personalizados
│   └── useAuth.ts     # Hook de autenticação
├── lib/               # Utilitários e configurações
│   └── supabase.ts    # Cliente Supabase
└── styles/            # Estilos globais
```

## 🔑 Funcionalidades de Autenticação

### ✅ Implementadas
- [x] Login com email/senha
- [x] Cadastro de novos usuários
- [x] Verificação de email
- [x] Logout seguro
- [x] Proteção de rotas
- [x] Persistência de sessão
- [x] Redirecionamento automático
- [x] Mensagens de erro em português
- [x] Estados de loading

### 🔄 Próximas Funcionalidades
- [ ] Recuperação de senha
- [ ] Login com Google/GitHub
- [ ] Autenticação de dois fatores
- [ ] Gerenciamento de perfil

## 🛡️ Segurança

- **Row Level Security**: Cada usuário só acessa seus dados
- **Políticas SQL**: Controle granular de acesso
- **Validação de dados**: Frontend e backend
- **Sanitização**: Prevenção contra SQL injection
- **HTTPS**: Comunicação criptografada
- **JWT Tokens**: Autenticação stateless

## 📱 Páginas Disponíveis

- `/` - Dashboard principal (protegido)
- `/login` - Página de login
- `/register` - Página de cadastro
- `/clients` - Gestão de clientes (em desenvolvimento)
- `/schedule` - Agendamentos (em desenvolvimento)
- `/profile` - Perfil do usuário (em desenvolvimento)

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Servidor de produção
pnpm lint         # Verificar código
```

## 📊 Banco de Dados

### Tabelas Principais
- **clients**: Informações dos clientes
- **appointments**: Agendamentos
- **auth.users**: Usuários (gerenciado pelo Supabase)

Veja detalhes completos em [`README_TrimFlow_Database.md`](./README_TrimFlow_Database.md)

## 🚨 Troubleshooting

### Problemas Comuns

**Erro de autenticação:**
- Verifique as variáveis de ambiente
- Confirme se o projeto Supabase está ativo
- Valide as URLs de redirect

**Banco de dados:**
- Execute o script SQL completo
- Verifique se RLS está ativo
- Confirme as políticas de acesso

**Build/Deploy:**
- Configure variáveis no ambiente de produção
- Ajuste URLs de redirect para domínio final

Veja mais detalhes em [`SETUP_SUPABASE.md`](./SETUP_SUPABASE.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Desenvolvido com ❤️ para barbearias modernas**