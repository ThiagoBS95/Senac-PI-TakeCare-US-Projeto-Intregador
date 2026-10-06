# TakeCare — Projeto Integrador Senac

Aplicativo móvel de apoio ao cuidado e ao monitoramento de pessoas idosas, desenvolvido no
Projeto Integrador do curso de Tecnologia em Análise e Desenvolvimento de Sistemas (TADS/TSI)
do Centro Universitário Senac — EAD.

- **Protótipo navegável:** https://thiagobs95.github.io/Senac-PI-TakeCare-US-Projeto-Intregador/
- **Vídeo de demonstração (1ª etapa):** https://youtu.be/kh8lHRKAETs

---

## Em que ponto o projeto está

A **1ª etapa** entregou a documentação (visão de produto, partes interessadas, personas,
jornadas e protótipo) e um MVP navegável com dados simulados.

A **2ª etapa**, em desenvolvimento, implementa as jornadas descritas na documentação. O escopo
está organizado em três eixos:

| Eixo | O que entrega | Situação |
|---|---|---|
| A — Registro real | Persistência no dispositivo; listar, editar e excluir pessoas idosas e medicamentos | Em desenvolvimento |
| B — Controle de medicação | Lembrete no horário, confirmação da dose e histórico | A fazer |
| C — Emergência | Alerta com localização e acionamento do responsável | A fazer |

Requisito transversal de **acessibilidade**: tipografia ampliável, alto contraste, botão de
emergência alcançável de qualquer tela e rótulos para leitor de tela.

---

## Como rodar

Pré-requisitos: Node.js 20 ou superior e um aparelho Android (ou emulador).

```bash
npm install
npx expo start
```

Leia o código QR com o **Expo Go** para abrir no aparelho.

> As notificações do eixo B exigem um *development build* (`npx expo run:android`), porque o
> Expo Go não as suporta. Enquanto o eixo B não começa, o Expo Go atende.

---

## Estrutura

```
app/                      telas (roteamento por arquivo, Expo Router)
  (tabs)/index.tsx        painel inicial
  idosos.tsx              lista de pessoas idosas
  cadastro-idoso.tsx      cadastro e edição
  medicamentos.tsx        lista de medicamentos por pessoa
  cadastro-medicamento.tsx
data/                     camada de dados
  tipos.ts                modelo (Idoso, Medicamento, Dose)
  armazenamento.ts        persistência local (AsyncStorage)
  contexto.tsx            estado global e operações
components/, constants/, hooks/
```

As telas nunca acessam o armazenamento diretamente: usam o hook `useDados()`.

---

## Tecnologias

React Native 0.81 · Expo SDK 54 · Expo Router 6 · TypeScript · AsyncStorage · Git e GitHub

---

## Integrantes do grupo

- Angelo Dellagnolo Junior
- Beatriz Miranda Santos
- Denyzard Ubirajara Larios Moreira
- Marlon Rogério Correia Santana
- Matheus Nunes Friedrich
- Thiago Barbosa Silva
- Werick Luiz Monteiro

---

## Como contribuir (para o grupo)

1. Atualize o `main`: `git pull`
2. Crie uma branch por tarefa: `git checkout -b feature/nome-da-tarefa`
3. Faça commits pequenos, com mensagem no formato `feat:`, `fix:` ou `docs:`
4. Abra um Pull Request e peça revisão de outro integrante

Cada integrante deve commitar o próprio trabalho — o histórico do repositório faz parte da
avaliação.
