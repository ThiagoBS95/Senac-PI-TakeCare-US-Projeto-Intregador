/**
 * Teste de fluxo do eixo C (emergência), executado em navegador.
 *
 * Verifica: botão SOS alcançável fora do painel, tela de emergência com a
 * pessoa e o contato certos, ações de ligar e enviar mensagem, tratamento da
 * ausência de GPS e registro do acionamento no histórico.
 *
 * A ligação e o envio de mensagem em si só podem ser verificados em aparelho:
 * veja testes/roteiro-android.md.
 */
const { chromium } = require('playwright');
const EXE = '/home/angelo/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const BASE = 'http://localhost:8131';
const OUT = process.argv[2];

const ok = (t) => console.log('  OK    ' + t);
const bad = (t) => { console.log('  FALHA ' + t); process.exitCode = 1; };

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2, colorScheme: 'dark' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(String(e).slice(0, 200)));

  // --- preparo
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1300);
  await p.getByText('Idosos', { exact: true }).first().click();
  await p.waitForTimeout(700);
  await p.getByText('Cadastrar idoso').first().click();
  await p.waitForTimeout(700);
  const c = p.locator('input');
  await c.nth(0).fill('Antônio Peixoto');
  await c.nth(1).fill('74');
  await c.nth(2).fill('Cláudia Ramos');
  await c.nth(3).fill('11988887777');
  await p.getByText('Salvar', { exact: true }).first().click();
  await p.waitForTimeout(1300);
  ok('cenário preparado com telefone do responsável');

  // --- botão SOS global aparece fora do painel
  const sosGlobal = p.getByLabel('Acionar alerta de emergência');
  (await sosGlobal.count()) > 0
    ? ok('botão SOS presente fora do painel (alcançável de qualquer tela)')
    : bad('botão SOS global não apareceu na lista de idosos');

  // --- acionar pelo painel
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1100);
  await p.getByText('ALERTA SOS').first().click();
  await p.waitForTimeout(2500);

  let texto = await p.innerText('body');
  texto.includes('Emergência acionada') ? ok('tela de emergência abre') : bad('tela de emergência não abriu');
  texto.includes('Antônio Peixoto') ? ok('identifica a pessoa idosa') : bad('não identificou a pessoa');
  /Ligar para Cláudia Ramos/.test(texto)
    ? ok('oferece ligação para o responsável cadastrado')
    : bad('ação de ligar não apareceu');
  texto.includes('Enviar mensagem') ? ok('oferece mensagem com localização') : bad('ação de mensagem não apareceu');
  // No navegador o GPS está bloqueado: o app precisa seguir mesmo assim.
  (texto.includes('Sem localização') || texto.includes('Localização obtida'))
    ? ok('trata a ausência de GPS sem travar (teste adverso)')
    : bad('não tratou a falta de localização');
  await p.screenshot({ path: OUT + '/c-emergencia.png' });

  // --- o acionamento ficou registrado
  await p.getByText('Fechar').first().click();
  await p.waitForTimeout(1200);
  await p.getByText('Histórico', { exact: true }).first().click();
  await p.waitForTimeout(1200);
  await p.getByText(/Emergências/).first().click();
  await p.waitForTimeout(900);
  texto = await p.innerText('body');
  texto.includes('Antônio Peixoto') && !texto.includes('Nenhum acionamento')
    ? ok('acionamento gravado no histórico de emergências')
    : bad('acionamento não apareceu no histórico: ' + texto.slice(0, 140).replace(/\n/g, ' | '));
  await p.screenshot({ path: OUT + '/c-historico.png' });

  console.log(erros.length ? '  ERROS DE PÁGINA: ' + erros.slice(0, 3).join(' ;; ') : '  sem erros de console');
  await b.close();
})();
