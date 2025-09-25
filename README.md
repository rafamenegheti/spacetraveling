# SpaceTraveling 🚀

SpaceTraveling é uma plataforma de blog moderna construída com Next.js 10, apresentando integração com CMS headless Prismic, geração de sites estáticos, funcionalidade de paginação e uma experiência completa de leitura de artigos com navegação entre posts e sistema de comentários integrado.

## 🛠 Tecnologias

- **Next.js 10** - Framework React para produção
- **TypeScript** - Tipagem estática para JavaScript
- **Prismic CMS** - Sistema de gerenciamento de conteúdo headless
- **SCSS Modules** - Estilização com CSS modular
- **React Icons** - Biblioteca de ícones
- **Date-fns** - Manipulação de datas em português
- **Jest & Testing Library** - Testes unitários e de integração

## ✨ Funcionalidades

- 📝 **Blog posts** com conteúdo rico do Prismic
- 🔄 **Paginação** com carregamento de mais posts
- ⏱️ **Tempo de leitura** calculado automaticamente
- 🧭 **Navegação** entre posts (anterior/próximo)
- 💬 **Sistema de comentários** com Utterances
- 📱 **Design responsivo** 
- 🌐 **Localização** em português brasileiro
- ⚡ **SSG** (Static Site Generation) para performance

## 🚀 Como executar

```bash
# Instalar dependências
yarn install

# Executar em desenvolvimento
yarn dev

# Build para produção
yarn build

# Executar testes
yarn test
```

## 📦 Estrutura do projeto

```
src/
├── components/          # Componentes React
├── pages/              # Páginas Next.js
├── services/           # Integração com APIs
├── styles/             # Estilos SCSS
└── __tests__/          # Testes unitários
```

## 🔧 Configuração

1. Configure as variáveis de ambiente para o Prismic
2. Configure o repositório do Utterances para comentários
3. Execute o projeto localmente

---

Desenvolvido como projeto de aprendizado em Next.js e Prismic CMS.
