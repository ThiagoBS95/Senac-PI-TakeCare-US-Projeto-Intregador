# Roteiro de teste em aparelho Android

O que só pode ser verificado em aparelho real, com *development build*.
O Expo Go **não dispara notificação agendada** — se tentar por lá, nada acontece
e a conclusão é falsa.

## Preparar o build (uma vez)

```bash
npx expo run:android          # precisa de Android Studio instalado
# ou, pela nuvem, sem Android Studio:
npx eas build --profile development --platform android
```

Instale o APK gerado no aparelho e rode `npx expo start --dev-client`.

## Roteiro

| # | Passo | Esperado |
|---|---|---|
| 1 | Abrir o aplicativo pela primeira vez | O Android pede permissão de notificação |
| 2 | Negar a permissão e cadastrar um medicamento | O painel mostra o aviso "Lembretes desativados" |
| 3 | Tocar no aviso | A permissão é pedida de novo e o aviso some |
| 4 | Cadastrar um medicamento com horário 2 minutos à frente | O lembrete aparece na hora marcada, com o nome do remédio e a dosagem |
| 5 | Com o aplicativo **fechado**, esperar o horário | O lembrete aparece mesmo assim |
| 6 | Tocar no botão "Tomou" da própria notificação | A dose entra no histórico sem abrir o aplicativo |
| 7 | Tocar no corpo da notificação | O aplicativo abre direto na tela de confirmação da dose |
| 8 | Tocar em "Adiar 15 minutos" | Um novo lembrete chega 15 minutos depois |
| 9 | Editar o medicamento e trocar o horário | O lembrete antigo não toca mais; o novo toca no horário novo |
| 10 | Excluir o medicamento | Nenhum lembrete dele volta a tocar |
| 11 | Excluir a pessoa idosa com medicamentos | Os lembretes de todos os medicamentos dela param |
| 12 | Reiniciar o aparelho e esperar o próximo horário | O lembrete continua chegando |

## Armadilha conhecida

Alguns fabricantes (Xiaomi, Samsung, Motorola) matam aplicativos em segundo plano
por economia de bateria, e o lembrete não chega. Se os passos 5 ou 12 falharem,
verifique em **Configurações → Bateria → Sem restrições** para o TakeCare antes
de concluir que é defeito do código.

---

# Eixo C — emergência (aparelho Android)

| # | Passo | Esperado |
|---|---|---|
| 13 | Tocar em ALERTA SOS no painel | Abre a tela de emergência e pede permissão de localização |
| 14 | Conceder a permissão | A tela mostra as coordenadas e a precisão em metros |
| 15 | Tocar em "Ligar para <responsável>" | O discador abre com o número do responsável já preenchido |
| 16 | Voltar e tocar em "Enviar mensagem" | Abre o WhatsApp (ou o SMS) com o texto pronto e o link do mapa |
| 17 | Abrir o link do mapa na mensagem | O Google Maps mostra a posição correta |
| 18 | Negar a permissão de localização e acionar de novo | A tela avisa "Sem localização" e **ainda assim** oferece ligar e mandar mensagem |
| 19 | Desligar o GPS do aparelho e acionar | Mesma coisa: o pedido de ajuda não é bloqueado |
| 20 | Acionar sem telefone cadastrado | A tela orienta a cadastrar o telefone do responsável |
| 21 | Abrir qualquer tela interna (lista, histórico) | O botão SOS flutuante aparece no canto |
| 22 | Ver Histórico → aba Emergências | Cada acionamento aparece com data, hora, localização e as ações feitas |

---

# Acessibilidade (aparelho Android)

| # | Passo | Esperado |
|---|---|---|
| 23 | Painel → Acessibilidade → Texto "Maior" | Todas as telas aumentam a fonte, sem cortar texto nem quebrar o leiaute |
| 24 | Ligar "Alto contraste" | Fundo preto, bordas brancas visíveis e texto branco em todas as telas |
| 25 | Fechar e reabrir o aplicativo | As preferências continuam valendo |
| 26 | Ativar o TalkBack (leitor de tela) e percorrer o painel | Cada botão é anunciado pelo que faz: "Idosos", "Acionar alerta de emergência", "Acessibilidade" |
| 27 | Com TalkBack ligado, abrir a lista de idosos | Os botões de editar e excluir são anunciados com o nome da pessoa |
| 28 | Aumentar a fonte do sistema para o máximo (Configurações do Android) | O aplicativo continua legível e utilizável |
