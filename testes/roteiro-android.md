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
