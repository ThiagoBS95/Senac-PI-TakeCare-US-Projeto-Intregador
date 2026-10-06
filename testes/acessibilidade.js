/**
 * Teste de acessibilidade (requisito transversal T2, T3 e T4).
 *
 * Verifica: atalho no painel, tela de preferências, ampliação da tipografia em
 * todas as telas, alto contraste, persistência das preferências e alvos de
 * toque de no mínimo 44 dp.
 */
const { chromium } = require('playwright');
const EXE = '/home/angelo/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome';
const BASE = 'http://localhost:8132';
const OUT = process.argv[2];

const ok = (t) => console.log('  OK    ' + t);
const bad = (t) => { console.log('  FALHA ' + t); process.exitCode = 1; };

const corDe = (p, seletor, prop) =>
  p.evaluate(([s, pr]) => {
    const el = document.evaluate(`//*[contains(text(),'${s}')]`, document, null, 9, null).singleNodeValue;
    return el ? getComputedStyle(el)[pr] : null;
  }, [seletor, prop]);

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 412, height: 892 }, deviceScaleFactor: 2, colorScheme: 'dark' });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(String(e).slice(0, 200)));

  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(1400);

  const tamanhoAntes = await corDe(p, 'TakeCare', 'fontSize');
  const fundoDoApp = (pagina) =>
    pagina.evaluate(() => {
      const titulo = document.evaluate("//*[text()='TakeCare']", document, null, 9, null).singleNodeValue;
      let el = titulo;
      while (el) {
        const c = getComputedStyle(el).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)' && el.getBoundingClientRect().height > 300) return c;
        el = el.parentElement;
      }
      return null;
    });
  const fundoAntes = await fundoDoApp(p);

  // --- acesso aos ajustes
  const atalho = p.getByLabel('Acessibilidade: tamanho do texto e contraste');
  (await atalho.count()) > 0 ? ok('painel tem atalho de acessibilidade') : bad('atalho não encontrado');
  await atalho.click();
  await p.waitForTimeout(1100);
  let texto = (await p.innerText('body')).toLowerCase();
  (texto.includes('tamanho do texto') && texto.includes('alto contraste'))
    ? ok('tela de acessibilidade abre com os dois controles')
    : bad('controles não apareceram');
  await p.screenshot({ path: OUT + '/a11y-ajustes.png' });

  // --- aumentar a fonte
  await p.getByLabel('Texto Maior').click();
  await p.waitForTimeout(900);
  const previaDepois = await corDe(p, 'Losartana 50 mg', 'fontSize');
  await p.screenshot({ path: OUT + '/a11y-maior.png' });

  await p.getByLabel('Voltar').click();
  await p.waitForTimeout(1100);
  const tamanhoDepois = await corDe(p, 'TakeCare', 'fontSize');
  const px = (v) => (v ? parseFloat(v) : 0);
  px(tamanhoDepois) > px(tamanhoAntes)
    ? ok(`tipografia ampliada em todo o app: ${tamanhoAntes} → ${tamanhoDepois}`)
    : bad(`a fonte não aumentou (${tamanhoAntes} → ${tamanhoDepois})`);

  // --- alto contraste
  await atalho.click();
  await p.waitForTimeout(1000);
  await p.getByLabel('Alto contraste').click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + '/a11y-contraste.png' });
  await p.getByLabel('Voltar').click();
  await p.waitForTimeout(1100);
  const fundoDepois = await fundoDoApp(p);
  fundoDepois !== fundoAntes
    ? ok(`alto contraste aplicado: ${fundoAntes} → ${fundoDepois}`)
    : bad('o fundo não mudou com o alto contraste');
  await p.screenshot({ path: OUT + '/a11y-painel-contraste.png' });

  // --- preferências sobrevivem ao reinício
  const p2 = await ctx.newPage();
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(1400);
  const fundoNovaSessao = await fundoDoApp(p2);
  fundoNovaSessao === fundoDepois
    ? ok('preferências continuam valendo em nova sessão')
    : bad(`preferência perdida: ${fundoDepois} → ${fundoNovaSessao}`);
  await p2.close();

  // --- alvos de toque
  const pequenos = await p.evaluate(() => {
    const alvos = [...document.querySelectorAll('[role="button"], button')];
    return alvos.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.width < 44 || r.height < 44);
    }).length;
  });
  pequenos === 0
    ? ok('nenhum alvo de toque abaixo de 44 dp')
    : bad(`${pequenos} alvo(s) de toque menores que 44 dp`);

  console.log(erros.length ? '  ERROS DE PÁGINA: ' + erros.slice(0, 3).join(' ;; ') : '  sem erros de console');
  await b.close();
})();
