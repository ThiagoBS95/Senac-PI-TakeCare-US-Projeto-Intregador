/**
 * Teste de fluxo do eixo B (controle de medicação), executado em navegador.
 *
 * Verifica: tela de confirmação da dose, registro no histórico, cálculo da
 * adesão e persistência entre sessões.
 *
 * O disparo da notificação em si NÃO é coberto aqui: depende de um
 * development build em aparelho Android. Veja testes/roteiro-android.md.
 *
 * Como rodar: ver instruções em testes/fluxo-eixo-a.js
 */
const { chromium } = require('playwright');
const EXE = '/home/angelo/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const BASE = 'http://localhost:8130';
const OUT = process.argv[2];

const ok = (t) => console.log('  OK    ' + t);
const bad = (t) => { console.log('  FALHA ' + t); process.exitCode = 1; };

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2, colorScheme: 'dark' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(String(e).slice(0, 200)));

  // --- preparo: um idoso e um medicamento
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.getByText('Idosos', { exact: true }).first().click();
  await p.waitForTimeout(700);
  await p.getByText('Cadastrar idoso').first().click();
  await p.waitForTimeout(700);
  let c = p.locator('input');
  await c.nth(0).fill('Antônio Peixoto');
  await c.nth(1).fill('74');
  await c.nth(2).fill('Cláudia Ramos');
  await p.getByText('Salvar', { exact: true }).first().click();
  await p.waitForTimeout(1200);

  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  await p.getByText('Medicamentos', { exact: true }).first().click();
  await p.waitForTimeout(800);
  await p.getByText('Cadastrar medicamento').first().click();
  await p.waitForTimeout(800);
  c = p.locator('input');
  await c.nth(0).fill('Losartana 50 mg');
  await c.nth(1).fill('1 comprimido');
  await c.nth(2).fill('0800');
  await p.getByLabel('Adicionar horário').click();
  await p.waitForTimeout(300);
  await p.getByText('Salvar', { exact: true }).first().click();
  await p.waitForTimeout(1400);
  ok('cenário preparado (idoso + medicamento)');

  // --- registrar dose
  await p.getByLabel('Registrar dose de Losartana 50 mg').click();
  await p.waitForTimeout(1000);
  let texto = await p.innerText('body');
  (texto.includes('Losartana 50 mg') && texto.includes('Tomou') && texto.includes('Não tomou'))
    ? ok('tela de confirmação da dose abre com as três respostas')
    : bad('tela de dose não apareceu: ' + texto.slice(0, 120).replace(/\n/g, ' | '));
  await p.screenshot({ path: OUT + '/b-dose.png' });

  await p.getByText('Tomou', { exact: true }).first().click();
  await p.waitForTimeout(1400);

  // --- histórico
  texto = await p.innerText('body');
  texto.includes('Histórico de doses') ? ok('redireciona para o histórico') : bad('não foi para o histórico');
  texto.includes('Tomada') ? ok('dose registrada como tomada') : bad('registro da dose não apareceu');
  /100%/.test(texto) ? ok('indicador de adesão calculado (100%)') : bad('adesão não calculada: ' + texto.slice(0, 100));
  await p.screenshot({ path: OUT + '/b-historico.png' });

  // --- persistência do histórico
  const p2 = await ctx.newPage();
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(1300);
  const painel = await p2.innerText('body');
  painel.includes('1 dose(s) registradas')
    ? ok('painel mostra o histórico gravado (persistência)')
    : bad('painel não refletiu a dose: ' + painel.replace(/\n+/g, ' | ').slice(0, 160));
  await p2.screenshot({ path: OUT + '/b-painel.png' });
  await p2.close();

  console.log(erros.length ? '  ERROS DE PÁGINA: ' + erros.slice(0, 3).join(' ;; ') : '  sem erros de console');
  await b.close();
})();
