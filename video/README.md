# Vídeo de demonstração — 2ª etapa

`TakeCare-demonstracao.mp4` — 57 s, 412x892, H.264 + AAC.

Oito cenas, narradas em português, gravadas do próprio aplicativo:

| # | Cena | O que mostra |
|---|---|---|
| 1 | Painel | Abertura |
| 2 | Cadastro da pessoa idosa | Data de nascimento e telefone do responsável |
| 3 | Cadastro do medicamento | Dosagem e os dois horários do dia |
| 4 | Confirmação da dose | Tomou / Adiar 15 minutos / Não tomou |
| 5 | Histórico | Percentual de doses confirmadas |
| 6 | Emergência | Ligação, mensagem e o pedido valendo sem localização |
| 7 | Acessibilidade | Os três tamanhos de texto e o alto contraste |
| 8 | Fecho | Painel em alto contraste |

Não confundir com o vídeo da 1ª etapa (https://youtu.be/kh8lHRKAETs), que mostra
o protótipo de telas simuladas, anterior à implementação.

A localização aparece como indisponível porque a gravação saiu do build web, que
não tem GPS. Em aparelho isso foi verificado: o acionamento devolveu coordenadas
reais com precisão de 14 metros, com o SMS e a ligação. Os passos que só existem
em aparelho estão em `testes/roteiro-android.md`.
