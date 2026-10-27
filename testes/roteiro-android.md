# Roteiro de teste em aparelho Android

O que só pode ser verificado em aparelho real. O Expo Go **não dispara
notificação agendada** — se tentar por lá, nada acontece e a conclusão é falsa.

## O APK já está compilado

`android/app/build/outputs/apk/release/app-release.apk` (62 MB). Instala e abre
sozinho: o JavaScript vem embutido e não é preciso computador na mesma rede.

Para instalar no aparelho, por cabo:

```bash
adb install -r app-release.apk
```

Ou copie o arquivo para o celular e abra pelo gerenciador de arquivos, liberando
"instalar de fontes desconhecidas" quando o Android perguntar.

### Como recompilar

O bundle JavaScript **precisa ser gerado no WSL**. O Metro que o Gradle executa
(Node do Windows) produz um pacote defeituoso: o aplicativo instala, abre e morre
com `TypeError: Cannot read property '<hook>' of null` — nenhum hook do React
funciona, mesmo num componente mínimo. O mesmo código empacotado no WSL funciona.

```bash
# 1. pacote JavaScript, no WSL
npx expo export --platform android --output-dir /tmp/bundle-prod

# 2. parte nativa, pelo Windows, a partir de um caminho curto
#    (de C:\Users\...\Senac-PI-... os caminhos passam de 260 caracteres
#     e o ninja falha com "error: Stat(...)"; use uma junção: mklink /J C:\tc <projeto>)
cd C:\tc\android
gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a

# 3. trocar o bundle dentro do APK e assinar de novo
#    (descartar META-INF/*.{RSA,SF,MF}: a assinatura antiga não vale mais)
zipalign -p -f 4 trocado.apk alinhado.apk
apksigner sign --ks android/app/debug.keystore --ks-pass pass:android \
  --key-pass pass:android --ks-key-alias androiddebugkey \
  --out TakeCare.apk alinhado.apk
```

**Antes de recompilar, apague `android/app/build/outputs/apk/release`.** O Gradle
marca `:app:packageRelease` como `UP-TO-DATE` e mantém o APK antigo mesmo com
bundle novo — dá para testar o arquivo errado sem perceber.

### Tem de ser release, não debug

No build de **debug** o bundle não é embutido: o aplicativo abre numa tela
"Development Build" pedindo `npx expo start` e um servidor em `localhost:8081`,
e não há como seguir o roteiro. Conferir antes de distribuir:

```bash
unzip -l TakeCare.apk | grep index.android.bundle
```

Se a linha não aparecer, o APK é o de desenvolvimento e não serve. `x86_64` só
roda em emulador — o Android recusa a instalação desse APK em aparelho real.

### Por que não dá para rodar isto em emulador nesta máquina

O emulador do Android congela antes de iniciar o sistema convidado — zero uso de
CPU logo após `Windows Hypervisor Platform accelerator is operational`. Reproduz
igual em Android 34 e 37, com e sem janela, com e sem aceleração por hardware e
nos três modos de GPU. A máquina de desenvolvimento tem um Intel i7-2600 (2011,
sem AVX2), abaixo do que o emulador atual exige.

Não é perda: os passos 5, 12 e a armadilha de economia de bateria **só existem em
aparelho real** — um emulador jamais os validaria.

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


---

## Como registrar o resultado

Marque cada passo com **OK**, **FALHOU** ou **N/A** e, quando falhar, anote o
aparelho (marca, modelo, versão do Android) e o que apareceu na tela. Um passo
que falha em um aparelho e passa em outro é informação útil — quase sempre é a
economia de bateria do fabricante, não o código.

| Aparelho | Android | Passos verificados | Falhas | Observações |
|---|---|---|---|---|
| Moto G86 5G | 16 | abertura, cadastro, medicamento com 3 horários, confirmação de dose, histórico, emergência, acessibilidade | nenhuma | Angelo, 26/10 |
| (Marlon) | — | tela inicial, cadastro de idoso, cadastro de medicamento com 08:00/16:00/20:00, SOS com **localização real obtida (±14 m)**, SMS com link do mapa, ligação para o contato | nenhuma | 26/10, à noite |
|  |  |  |  |  |

### Evidência da emergência em aparelho

O acionamento do SOS no aparelho do Marlon devolveu **coordenadas reais com
precisão de 14 metros**, abriu o SMS com o link do Google Maps apontando o
endereço certo e disparou a ligação para o contato cadastrado. Isso cobre os
passos 13 a 17, que o navegador nunca conseguiu demonstrar: no build web a
localização sempre falha, por falta de GPS.
