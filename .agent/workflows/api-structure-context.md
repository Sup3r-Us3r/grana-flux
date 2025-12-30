---
description: Documento normativo da API Nest.js, adota Clean Architecture, DDD e SOLID. Define camadas, responsabilidades, padrões de código, nomenclaturas, contratos, testes e integrações. Deve ser a única fonte de verdade para gerar código e testes
---

# CONTEXTO ARQUITETURAL DA API

## 1. Visão Geral

Esta API backend é construída utilizando Nest.js, TypeScript, Prisma ORM, PostgreSQL, RabbitMQ, Socket.io e Vitest. A arquitetura segue obrigatoriamente Clean Architecture, Domain-Driven Design (DDD) e os princípios SOLID.

A estrutura é organizada por camadas explícitas, com responsabilidades bem definidas e dependências unidirecionais. Nenhuma camada pode violar os limites aqui descritos.

---

## 2. Estrutura de Pastas (Obrigatória)

A organização do projeto deve seguir rigorosamente esta árvore:

src/
- main.ts
- application/
  - use-cases/
    - [modulo]/
      - [caso-de-uso]/
        - [caso-de-uso]-dto.ts
        - [caso-de-uso]-use-case.ts
        - [caso-de-uso]-use-case.spec.ts
- domain/
  - providers/
    - cache-provider.ts
    - email-provider.ts
    - hash-provider.ts
  - shared/
    - value-objects/
  - [modulo]/
    - entities/
    - repositories/
    - value-objects/
- infrastructure/
  - config/
    - rabbitmq-config.ts
  - database/
    - memory/
      - [modulo]-in-memory-repository.ts
    - prisma/
    - repositories/
      - prisma-[modulo]-repository.ts
  - email/
    - email-template-service.ts
    - templates/
  - messaging/
    - consumers/
    - publishers/
    - rabbitmq/
  - providers/
    - bcrypt-hash-provider.ts
    - redis-cache-provider.ts
    - smtp-email-provider.ts
  - websocket/
    - gateways/
- presentation/
  - http/
    - controllers/
      - [modulo]-controller.ts
    - dtos/
      - [modulo]/
  - modules/
    - app-module.ts
    - rabbitmq-module.ts
    - websocket-module.ts
    - [modulo]-module.ts
- shared/
  - exceptions/
    - domain-exception.ts
    - internal-server-error-exception.ts
    - not-found-exception.ts
    - validation-exception.ts
  - types/
  - utils/

Nenhuma implementação pode divergir desta organização.

---

## 3. Camada Application (Use Cases)

Local: src/application/use-cases

Responsabilidade:
- Orquestrar fluxos de negócio
- Coordenar entidades, repositórios e providers
- Representar ações explícitas do sistema

Regras obrigatórias:
- Um diretório por caso de uso
- Um use case por ação (Create, Update, Delete, Get, List)
- Cada caso de uso contém:
  - DTO de entrada/saída
  - Classe do use case
  - Teste unitário (.spec.ts)

É proibido:
- Importar Prisma
- Importar Nest.js
- Conter lógica de infraestrutura
- Criar regras de negócio complexas (pertencem ao domínio)

---

## 4. Camada Domain (Regra de Negócio)

Local: src/domain

Responsabilidade:
- Conter regras de negócio puras
- Modelar o domínio de forma explícita

### 4.1 Entidades
Local: src/domain/[modulo]/entities

- Representam conceitos centrais do domínio
- Possuem identidade
- Garantem invariantes

### 4.2 Value Objects
Local:
- src/domain/[modulo]/value-objects
- src/domain/shared/value-objects

- São imutáveis
- Não possuem identidade
- Validam regras próprias (ex: CPF, Email, Address)

### 4.3 Repositórios
Local: src/domain/[modulo]/repositories

- São interfaces
- Definem contratos de persistência
- Não conhecem implementações concretas

### 4.4 Providers (Abstrações)
Local: src/domain/providers

- Interfaces para serviços externos:
  - cache-provider.ts: Interface para operações de cache
  - hash-provider.ts: Interface para hashing de senhas
  - email-provider.ts: Interface para envio de emails
- Nunca possuem implementação nesta camada

É proibido:
- Importar Nest.js
- Importar Prisma
- Acessar banco de dados
- Conhecer HTTP, RabbitMQ ou WebSocket

---

## 5. Camada Infrastructure

Local: src/infrastructure

Responsabilidade:
- Implementar detalhes técnicos
- Conectar o sistema a serviços externos

### 5.1 Banco de Dados

Local:
- src/infrastructure/database/prisma
- src/infrastructure/database/repositories

Regras:
- Prisma é usado exclusivamente aqui
- Repositórios Prisma implementam interfaces do domínio
- Models Prisma não vazam para outras camadas
- Implementações em memória são permitidas para testes

### 5.2 Providers Concretos

Local: src/infrastructure/providers

- Implementam interfaces definidas no domínio:
  - bcrypt-hash-provider.ts: Implementação de HashProvider usando bcrypt
  - redis-cache-provider.ts: Implementação de CacheProvider usando Redis
  - smtp-email-provider.ts: Implementação de EmailProvider usando SMTP/Nodemailer

### 5.3 Email

Local: src/infrastructure/email

Estrutura:
- email-template-service.ts: Serviço para renderização de templates
- templates/: Contém templates de email (ex: React Email)

Regras:
- Nunca contém regra de negócio
- Templates são renderizados pelo EmailTemplateService

### 5.4 Configurações

Local: src/infrastructure/config

- rabbitmq-config.ts: Configurações do RabbitMQ

### 5.5 RabbitMQ

Local:
- src/infrastructure/messaging/rabbitmq
- src/infrastructure/messaging/publishers
- src/infrastructure/messaging/consumers

Regras:
- Use cases disparam eventos
- Publishers traduzem eventos em mensagens
- Consumers executam ações chamando use cases
- Consumers não contêm regra de negócio

---

## 6. WebSocket (Socket.io)

Local: src/infrastructure/websocket/gateways

Responsabilidade:
- Comunicação em tempo real
- Apenas adaptação de eventos

Regras:
- Gateways não contêm regra de negócio
- Gateways apenas chamam use cases
- DTOs próprios para comunicação via socket

---

## 7. Camada Presentation (API)

Local: src/presentation

### 7.1 Controllers HTTP

Local: src/presentation/http/controllers

Responsabilidade:
- Adaptar HTTP para aplicação
- Validar entrada
- Chamar use cases

Regras:
- Não contém lógica de negócio
- Não acessa Prisma
- Trabalha apenas com DTOs

### 7.2 DTOs HTTP

Local: src/presentation/http/dtos

- DTOs específicos de transporte HTTP
- Diferentes dos DTOs de application, se necessário

### 7.3 Modules

Local: src/presentation/modules

Módulos existentes:
- app-module.ts: Módulo principal da aplicação
- rabbitmq-module.ts: Módulo de mensageria RabbitMQ
- websocket-module.ts: Módulo de WebSocket
- [modulo]-module.ts: Módulos de domínio específicos (ex: users-module.ts)

Responsabilidades:
- Organização dos módulos Nest.js
- Realizam injeção de dependência
- Conectam camadas sem violar dependências

---

## 8. Shared

### 8.1 Exceptions
Local: src/shared/exceptions

Exceções padronizadas disponíveis:
- domain-exception.ts: Exceção base de domínio
- internal-server-error-exception.ts: Erros internos do servidor
- not-found-exception.ts: Recurso não encontrado
- validation-exception.ts: Erros de validação

Regras:
- Exceções de domínio não dependem de Nest.js

### 8.2 Utils e Types
Local:
- src/shared/utils
- src/shared/types

- Utilitários genéricos
- Tipos reutilizáveis
- Sem dependência de infraestrutura

---

## 9. Testes

### Testes Unitários
- Localizados junto ao use case
- Testam regras e fluxos
- Dependências mockadas
- Sem Nest.js e sem banco real

### Testes E2E
- Localizados na camada presentation
- Usam Nest Testing Module
- Testam fluxo completo (HTTP → Use Case → Infra)

Vitest é obrigatório.

---

## 10. Convenções Gerais

- PascalCase para classes
- camelCase para métodos e propriedades
- kebab-case para nomes de arquivos (ex: create-user-use-case.ts)
- Um arquivo por classe
- Nomes devem refletir intenção de negócio
- Não existem services genéricos

---

## 11. Diretrizes Obrigatórias para a LLM

Ao gerar qualquer funcionalidade, a LLM deve obrigatoriamente:
1. Respeitar a árvore de diretórios definida
2. Identificar o domínio envolvido
3. Criar entidades e value objects quando necessário
4. Criar interfaces de repositório no domínio
5. Criar use cases explícitos na camada application
6. Criar implementações técnicas na infraestrutura
7. Criar controllers ou gateways apenas como adaptadores
8. Criar testes unitários e E2E compatíveis

É proibido:
- Pular camadas
- Misturar responsabilidades
- Colocar regra de negócio fora do domínio
- Introduzir padrões não definidos neste documento