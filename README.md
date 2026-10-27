# TakeCare — Projeto Integrador Senac

Aplicativo móvel de apoio ao cuidado e ao monitoramento de pessoas idosas, desenvolvido no
Projeto Integrador do curso de Tecnologia em Análise e Desenvolvimento de Sistemas (TADS/TSI)
do Centro Universitário Senac — EAD.

- **Vídeo de demonstração (2ª etapa):** [`video/TakeCare-demonstracao.mp4`](video/) — 57 s, narrado
- **Protótipo navegável (1ª etapa):** https://thiagobs95.github.io/Senac-PI-TakeCare-US-Projeto-Intregador/
- **Vídeo da 1ª etapa:** https://youtu.be/kh8lHRKAETs — telas simuladas, anterior à implementação

---

## Em que ponto o projeto está

A **1ª etapa** entregou a documentação (visão de produto, partes interessadas, personas,
jornadas e protótipo) e um MVP navegável com dados simulados.

A **2ª etapa** implementou as jornadas descritas na documentação:

| Eixo | O que entrega | Situação |
|---|---|---|
| A — Registro real | Cadastros gravados no aparelho; listar, editar e excluir, com exclusão em cascata | ✅ |
| B — Controle de medicação | Lembrete diário por horário, confirmação da dose pela notificação, histórico com adesão | ✅ |
| C — Emergência | Localização, ligação para o responsável, mensagem com o mapa e registro do acionamento | ✅ |
| Acessibilidade | Três tamanhos de texto, alto contraste, alvos de 48 dp, rótulos para leitor de tela | ✅ |

Fora do escopo desta etapa: autenticação e vínculo de perfis em servidor — o alerta chega ao
responsável pelos canais do telefone, não por notificação entre aparelhos.

Verificado em aparelho: o acionamento de emergência devolveu coordenadas reais com precisão de
14 metros, com a mensagem contendo o link do mapa e a ligação para o contato cadastrado.

## Testes

```bash
npx expo export --platform web --output-dir dist
npx http-server dist -p 8130
node testes/fluxo-eixo-a.js ./capturas    # 9 verificações
node testes/fluxo-eixo-b.js ./capturas    # 6 verificações
node testes/fluxo-eixo-c.js ./capturas    # 8 verificações
node testes/acessibilidade.js ./capturas  # 6 verificações
```

O que não existe no navegador — notificação com o app fechado, GPS, leitor de tela — está no
roteiro manual em [testes/roteiro-android.md](testes/roteiro-android.md), com 28 passos.

---

## Como rodar

**Para só usar o aplicativo**, instale o APK gerado a partir deste repositório: ele embute o
código e abre sozinho, sem computador na mesma rede. Veja
[testes/roteiro-android.md](testes/roteiro-android.md) para gerar e instalar.

**Para desenvolver**, é preciso Node.js 20 ou superior:

```bash
npm install
npx expo start --dev-client
```

> O **Expo Go não serve**: ele não executa notificações agendadas, que são o eixo B inteiro.
> É preciso um pacote nativo instalado no aparelho.

> Ao gerar o APK, o pacote JavaScript **precisa ser montado em ambiente Linux**. O Metro
> executado pelo Gradle no Windows produz um pacote em que nenhum hook do React funciona —
> o aplicativo instala, abre e fecha. O procedimento completo está no roteiro.

---

## Estrutura

```
app/                      telas (roteamento por arquivo, Expo Router)
  (tabs)/index.tsx        painel inicial
  idosos.tsx              lista de pessoas idosas
  cadastro-idoso.tsx      cadastro e edição
  medicamentos.tsx        lista de medicamentos por pessoa
  cadastro-medicamento.tsx
  dose.tsx                confirmação da dose (abre pelo lembrete)
  historico.tsx           doses e acionamentos de emergência
  emergencia.tsx          alerta com localização e contato
  ajustes.tsx             tamanho do texto e alto contraste
data/                     camada de dados e serviços
  tipos.ts                modelo (Idoso, Medicamento, Dose, Alerta)
  armazenamento.ts        persistência local (AsyncStorage) e migração de esquema
  contexto.tsx            estado global e operações
  notificacoes.ts         agendamento dos lembretes
  emergencia.ts           localização, ligação e mensagem
  preferencias.tsx        acessibilidade
constants/tema.ts         paletas e escalas de texto
testes/                   roteiros automatizados e de aparelho
```

As telas nunca acessam o armazenamento diretamente: usam o hook `useDados()`.

---

## Tecnologias

React Native 0.81 · Expo SDK 54 · Expo Router 6 · TypeScript · AsyncStorage · expo-notifications · expo-location · Git e GitHub

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
