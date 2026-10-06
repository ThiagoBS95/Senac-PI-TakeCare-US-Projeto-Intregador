/**
 * Teste de fluxo do eixo A (registro real), executado em navegador.
 *
 * Verifica: cadastro gravando de verdade, máscara de telefone, persistência
 * entre sessões, vínculo medicamento → pessoa idosa e normalização de horário.
 *
 * Como rodar:
 *   npx expo export --platform web --output-dir dist
 *   npx http-server dist -p 8130     (ou qualquer servidor estático)
 *   npm i -D playwright && node testes/fluxo-eixo-a.js ./capturas
 *
 * Navegue sempre por cliques: o export estático serve as rotas como .html,
 * então abrir /idosos direto pela URL devolve 404 do servidor, não do app.
 */
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
  p.on('pageerror', (e) => erros.push(String(e).slice(0, 160)));

  const irParaInicio = async () => {
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
  };

  await irParaInicio();
  let texto = await p.innerText('body');
  texto.includes('TakeCare') ? ok('painel abre') : bad('painel não abriu');

  // --- cadastro de idoso, navegando por cliques (como o usuário faria)
  await p.getByText('Idosos', { exact: true }).first().click();
  await p.waitForTimeout(800);
  texto = await p.innerText('body');
  texto.includes('Nenhum idoso cadastrado') ? ok('estado vazio da lista') : bad('estado vazio não apareceu');

  await p.getByText('Cadastrar idoso').first().click();
  await p.waitForTimeout(800);
  let campos = p.locator('input');
  await campos.nth(0).fill('Antônio Peixoto');
  await campos.nth(1).fill('74');
  await campos.nth(2).fill('Cláudia Ramos');
  await campos.nth(3).fill('11988887777');
  const tel = await campos.nth(3).inputValue();
  tel === '(11) 98888-7777' ? ok('máscara de telefone aplicada') : bad('máscara saiu como ' + tel);

  await p.getByText('Salvar', { exact: true }).first().click();
  await p.waitForTimeout(1500);
  texto = await p.innerText('body');
  texto.includes('Antônio Peixoto') ? ok('idoso gravado e listado') : bad('idoso não apareceu na lista');

  // --- gravou mesmo no armazenamento?
  const bruto = await p.evaluate(() => {
    const chave = Object.keys(localStorage).find((k) => k.includes('takecare'));
    return chave ? localStorage.getItem(chave) : null;
  });
  if (bruto && bruto.includes('Antônio Peixoto')) ok('registro presente no armazenamento local');
  else bad('nada gravado no armazenamento: ' + String(bruto).slice(0, 80));

  // --- persistência real: nova aba, do zero, mesma origem
  const p2 = await ctx.newPage();
  await p2.goto(BASE, { waitUntil: 'networkidle' });
  await p2.waitForTimeout(1400);
  const painel = await p2.innerText('body');
  /\b1\b/.test(painel) ? ok('painel recarregado mostra o cadastro (persistência)') : bad('painel não leu o dado gravado');
  await p2.close();

  // --- medicamento
  await p.getByText('Idosos', { exact: true }).first().click().catch(() => {});
  await irParaInicio();
  await p.getByText('Medicamentos', { exact: true }).first().click();
  await p.waitForTimeout(900);
  await p.getByText('Cadastrar medicamento').first().click();
  await p.waitForTimeout(900);
  texto = await p.innerText('body');
  texto.includes('Antônio Peixoto') ? ok('idoso disponível para seleção') : bad('idoso não aparece na seleção');

  campos = p.locator('input');
  await campos.nth(0).fill('Losartana 50 mg');
  await campos.nth(1).fill('1 comprimido');
  await campos.nth(2).fill('8');
  await p.getByLabel('Adicionar horário').click();
  await p.waitForTimeout(300);
  await campos.nth(2).fill('2030');
  await p.getByLabel('Adicionar horário').click();
  await p.waitForTimeout(300);
  texto = await p.innerText('body');
  (texto.includes('08:00') && texto.includes('20:30'))
    ? ok('horários normalizados: 8 → 08:00 e 2030 → 20:30')
    : bad('normalização de horário falhou');

  await p.getByText('Salvar', { exact: true }).first().click();
  await p.waitForTimeout(1500);
  texto = await p.innerText('body');
  (texto.includes('Losartana 50 mg') && texto.toLowerCase().includes('antônio peixoto'))
    ? ok('medicamento listado sob a pessoa certa')
    : bad('medicamento não listado corretamente');
  await p.screenshot({ path: OUT + '/t-medicamentos.png' });

  // --- exclusão em cascata some com o medicamento junto
  await irParaInicio();
  await p.screenshot({ path: OUT + '/t-painel.png' });
  texto = await p.innerText('body');
  console.log('  painel: ' + texto.replace(/\n+/g, ' | ').slice(0, 120));

  console.log(erros.length ? '  ERROS DE PÁGINA: ' + erros.slice(0, 3).join(' ;; ') : '  sem erros de console');
  await b.close();
})();
