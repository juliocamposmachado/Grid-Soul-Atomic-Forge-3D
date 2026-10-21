import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let child;
let port;
let baseUrl;
let testDirectory;
let serverOutput = '';

async function freePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const selected = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return selected;
}

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Servidor encerrou: ${serverOutput}`);
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Servidor não iniciou: ${serverOutput}`);
}

before(async () => {
  testDirectory = await mkdtemp(path.join(tmpdir(), 'gridsoul-test-'));
  await writeFile(path.join(testDirectory, 'memory.json'), JSON.stringify({
    version: 1, updatedAt: new Date().toISOString(), lastCommand: 'legacy private prompt fixture',
    lastPlan: { shape: 'sphere', population: 2000, energy: 0.6, scale: 1, reply: 'legacy private reply fixture' },
    history: [{ timestamp: new Date().toISOString(), status: 'success', command: 'legacy private prompt fixture', reply: 'legacy private reply fixture', shape: 'sphere', population: 2000 }]
  }));
  port = await freePort();
  baseUrl = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      GRID_SOUL_CHATGPT_BRIDGE: '',
      GRID_SOUL_PORT: String(port),
      GRID_SOUL_MEMORY_FILE: path.join(testDirectory, 'memory.json'),
      GRID_SOUL_AUTOMATION_DIR: path.join(testDirectory, 'automation')
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  child.stdout.setEncoding('utf8').on('data', chunk => { serverOutput += chunk; });
  child.stderr.setEncoding('utf8').on('data', chunk => { serverOutput += chunk; });
  await waitForServer();
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([
      new Promise(resolve => child.once('exit', resolve)),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
  }
  if (testDirectory) await rm(testDirectory, { recursive: true, force: true });
});

test('saúde, página e memória respondem sem exigir uma sessão de navegador', async () => {
  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(health.ok, true);
  assert.equal(health.bridge, 'extension');
  assert.equal(health.port, port);
  assert.equal(health.browserReady, false);

  const pageResponse = await fetch(`${baseUrl}/`);
  const page = await pageResponse.text();
  assert.equal(pageResponse.status, 200);
  assert.match(page, /GRID SOUL/);
  assert.match(page, /automationPanel/);
  const automationUi = await fetch(`${baseUrl}/automation-ui.js`);
  assert.equal(automationUi.status, 200);
  assert.match(await automationUi.text(), /INTERROMPER TUDO|autoStopAll/);

  const atlasResponse = await fetch(`${baseUrl}/assets/humanoid_face_88000.bin`);
  assert.equal(atlasResponse.status, 200);
  const atlasBytes = new Uint8Array(await atlasResponse.arrayBuffer());
  assert.equal(String.fromCharCode(...atlasBytes.subarray(0, 4)), 'GSF1');

  const memoryResponse = await fetch(`${baseUrl}/api/memory`);
  const memory = await memoryResponse.json();
  assert.equal(memoryResponse.status, 200);
  assert.equal(memory.lastPlan.shape, 'sphere');
  assert.equal(memory.lastPlan.reply, 'Estado visual restaurado.');
  assert.equal(memory.lastCommand, '');
  assert.equal(memory.historyCount, 1);
  const sanitized = await readFile(path.join(testDirectory, 'memory.json'), 'utf8');
  assert.equal(sanitized.includes('legacy private prompt fixture'), false);
  assert.equal(sanitized.includes('legacy private reply fixture'), false);
});

test('a extensão recebe e devolve um plano validado para um comando', async () => {
  const invalid = await fetch(`${baseUrl}/api/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' })
  });
  assert.equal(invalid.status, 400);

  const commandPromise = fetch(`${baseUrl}/api/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Transforme-se em um rosto humanoide.', population: 17000 })
  });

  let task;
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const response = await fetch(`${baseUrl}/api/extension/next`);
    task = await response.json();
    if (task.id) break;
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  assert.ok(task?.id, 'o servidor não disponibilizou a tarefa');
  assert.match(task.message, /elementos químicos são persistentes/);
  assert.equal((await (await fetch(`${baseUrl}/api/extension/next`)).json()).id, task.id, 'GET não deve consumir a tarefa');
  const claim = await fetch(`${baseUrl}/api/extension/claim`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id })
  });
  assert.equal(claim.status, 200);
  const duplicateClaim = await fetch(`${baseUrl}/api/extension/claim`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id })
  });
  assert.equal(duplicateClaim.status, 409);
  assert.deepEqual(await (await fetch(`${baseUrl}/api/extension/next`)).json(), {});

  const plan = {
    reply: 'Plano de teste validado.',
    shape: 'face',
    population: 1000,
    energy: 0.7,
    scale: 2,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
    color: '#00DFFF',
    parts: [],
    paletteMode: 'face',
    focusedAtomicNumber: 6
  };
  const resultResponse = await fetch(`${baseUrl}/api/extension/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: task.id, result: JSON.stringify(plan), error: '' })
  });
  assert.equal(resultResponse.status, 200);

  const commandResponse = await commandPromise;
  const returnedPlan = await commandResponse.json();
  assert.equal(commandResponse.status, 200);
  assert.equal(returnedPlan.population, 17000);
  assert.equal(returnedPlan.shape, 'face');
  assert.equal(returnedPlan.paletteMode, 'face');
  assert.equal(returnedPlan.focusedAtomicNumber, 6);
  assert.equal(returnedPlan.geometry.population, 17000);
  assert.equal(returnedPlan.identityVersion, 'cube-slot-modulo-118-v1');

  const memory = await (await fetch(`${baseUrl}/api/memory`)).json();
  assert.equal(memory.historyCount, 2);
  assert.equal(memory.lastPlan.identityVersion, 'cube-slot-modulo-118-v1');
  assert.equal(memory.lastCommand, '');
  const savedMemory = await readFile(path.join(testDirectory, 'memory.json'), 'utf8');
  assert.equal(savedMemory.includes('Transforme-se em um rosto humanoide.'), false);
  assert.equal(savedMemory.includes('Plano de teste validado.'), false);
});

test('o servidor normaliza o perfil grid_soul_humanoid aninhado e aceita sua população explícita', async () => {
  const profile = {
    object: 'grid_soul_humanoid',
    geometry: {
      type: 'human_face', representation: 'voxel_mesh', population: 88000, scale: 2.5,
      density: 0.92, distribution: 'surface_adaptive',
      grid: { type: '3d_cubic_lattice', cellShape: 'cube', size: 0.025, spacing: 0.004,
        adaptiveResolution: true, surfaceConforming: true, preserveFacialFeatures: true }
    },
    energy: 0.88, rotationX: -0.04, rotationY: 0.08, rotationZ: 0,
    moveX: 0, moveY: 0, moveZ: 0, color: '#00E5FF',
    materials: { base: '#005BFF', primary: '#00E5FF', secondary: '#7B2CFF', accent: '#FF38D1',
      highlight: '#FFD34D', metallic: 0.65, roughness: 0.22, emissiveIntensity: 1.8 },
    face: { symmetry: 0.92, eyeDetail: 1, noseDetail: 0.95, mouthDetail: 0.95,
      surfaceDisplacement: 0.035, expression: 'neutral', orientation: 'frontal' },
    mesh: { connectivity: 'neighbor_lattice', renderCubesIndividually: true,
      mergeAdjacentFaces: false, edgeDefinition: 0.08, surfaceContinuity: 0.94, lod: true },
    particles: { enabled: true, count: 1800, distribution: 'orbiting_surface', dispersion: 0.35,
      sizeVariation: 0.8, colors: ['#00E5FF', '#126BFF', '#A52CFF', '#FF38D1', '#FFD34D'] },
    lighting: { bloom: 1.4, contrast: 1.25, ambient: 0.12, keyLight: '#00CFFF',
      rimLight: '#A52CFF', background: '#020617' },
    render: { quality: 'ultra', antialiasing: true, shadows: true, depthOfField: 0.12,
      transparentBackground: false }
  };
  const message = 'Transforme-se em um rosto humanoide com população 88000.';
  const commandPromise = fetch(`${baseUrl}/api/command`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, population: 17000 })
  });
  let task;
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    task = await (await fetch(`${baseUrl}/api/extension/next`)).json();
    if (task.id) break;
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  assert.ok(task?.id, 'a tarefa do perfil não foi entregue à extensão');
  assert.equal((await fetch(`${baseUrl}/api/extension/claim`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id })
  })).status, 200);
  const resultResponse = await fetch(`${baseUrl}/api/extension/result`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: task.id, result: JSON.stringify({ ...profile, reply: 'Perfil facial aplicado.' }), error: '' })
  });
  assert.equal(resultResponse.status, 200);
  const commandResponse = await commandPromise;
  const plan = await commandResponse.json();
  assert.equal(commandResponse.status, 200);
  assert.equal(plan.object, 'grid_soul_humanoid');
  assert.equal(plan.shape, 'face');
  assert.equal(plan.population, 88000);
  assert.equal(plan.geometry.population, 88000);
  assert.equal(plan.scale, 2.5);
  assert.equal(plan.paletteMode, 'face');
  assert.equal(plan.geometry.grid.size, 0.025);
  assert.equal(plan.face.eyeDetail, 1);
  assert.equal(plan.particles.count, 1800);
  assert.equal(plan.render.quality, 'ultra');
  assert.equal(plan.faceProfile.lighting.background, '#020617');
  assert.equal(plan.faceProfile.geometry.referenceMode, 'cube_atlas');
  assert.equal(plan.identityVersion, 'cube-slot-modulo-118-v1');
});

test('pedido de rosto exatamente igual à referência adota 88.000 cubos sem nova população orbital', async () => {
  const message = 'Reconstrua o rosto anexo exatamente igual usando somente cubos.';
  const commandPromise = fetch(`${baseUrl}/api/command`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, population: 17000 })
  });
  let task;
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    task = await (await fetch(`${baseUrl}/api/extension/next`)).json();
    if (task.id) break;
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  assert.ok(task?.id, 'a tarefa de fidelidade à referência não chegou à extensão');
  assert.match(task.message, /somente os cubos instanciados/);
  assert.equal((await fetch(`${baseUrl}/api/extension/claim`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: task.id })
  })).status, 200);
  const resultResponse = await fetch(`${baseUrl}/api/extension/result`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: task.id, result: JSON.stringify({
      reply: 'Face de referência.', shape: 'face', population: 17000,
      energy: 0.88, scale: 2.5, rotationX: 0, rotationY: 0, rotationZ: 0,
      moveX: 0, moveY: 0, moveZ: 0, color: '#00E5FF'
    }), error: '' })
  });
  assert.equal(resultResponse.status, 200);
  const response = await commandPromise;
  const plan = await response.json();
  assert.equal(response.status, 200);
  assert.equal(plan.population, 88000);
  assert.equal(plan.geometry.population, 88000);
  assert.equal(plan.faceProfile.geometry.referenceMode, 'cube_atlas');
  assert.equal(plan.faceProfile.geometry.grid.size, 0.025);
});

test('a extensão não consegue responder com uma tarefa inexistente', async () => {
  const response = await fetch(`${baseUrl}/api/extension/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'nao-existe', result: '{}', error: '' })
  });
  assert.equal(response.status, 404);
});

test('automação começa negada, exige consentimento e recusa origens cruzadas', async () => {
  const permissions = await (await fetch(`${baseUrl}/api/automation/permissions`)).json();
  assert.deepEqual(permissions.permissions.enabled, { terminal: false, files: false, apps: false, browser: false });

  const denied = await fetch(`${baseUrl}/api/automation/terminal/run`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ command: 'pwd' })
  });
  assert.equal(denied.status, 403);

  const noConsent = await fetch(`${baseUrl}/api/automation/permissions/terminal`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: true })
  });
  assert.equal(noConsent.status, 400);

  const crossOrigin = await fetch(`${baseUrl}/api/automation/permissions/terminal`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
    body: JSON.stringify({ enabled: true, confirmed: true })
  });
  assert.equal(crossOrigin.status, 403);
});

test('comandos e arquivos exigem categorias, escopos e aprovação por operação', async () => {
  const api = async (route, method = 'POST', body = {}) => fetch(`${baseUrl}/api/automation${route}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: method === 'GET' ? undefined : JSON.stringify(body)
  });
  const enable = async category => {
    const response = await api(`/permissions/${category}`, 'PATCH', { enabled: true, confirmed: true });
    assert.equal(response.status, 200);
  };
  const managedDirectory = path.join(testDirectory, 'managed-files');
  await mkdir(managedDirectory, { recursive: true });
  await writeFile(path.join(managedDirectory, '.env'), 'PRIVATE_TEST_SECRET=never-read');
  const auditStream = await api('/events', 'GET');
  const auditReader = auditStream.body.getReader();
  const auditDecoder = new TextDecoder();
  let liveAudit = '';
  const awaitAuditEvent = (async () => {
    const timeout = setTimeout(() => { void auditReader.cancel(); }, 2_000);
    try {
      while (!liveAudit.includes('event: audit\n')) {
        const { value, done } = await auditReader.read();
        if (done) throw new Error('SSE fechou antes do evento de auditoria.');
        liveAudit += auditDecoder.decode(value, { stream: true });
      }
      return liveAudit;
    } finally { clearTimeout(timeout); }
  })();
  await enable('terminal');
  assert.match(await awaitAuditEvent, /"action":"permission"/);
  await auditReader.cancel();
  await enable('files');
  const scopeResponse = await api('/scopes/files', 'POST', { path: managedDirectory, confirmed: true });
  assert.equal(scopeResponse.status, 200);
  const nestedProfile = path.join(managedDirectory, 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default');
  await mkdir(nestedProfile, { recursive: true });
  const profileScope = await api('/scopes/files', 'POST', { path: nestedProfile, confirmed: true });
  assert.equal(profileScope.status, 400, 'subdiretórios de perfis de navegador também são bloqueados como raiz concedida');

  const shell = await api('/terminal/run', 'POST', { command: 'pwd; whoami' });
  assert.equal(shell.status, 400);
  const secretFile = await api('/files', 'POST', { action: 'read', path: '.env' });
  assert.equal(secretFile.status, 400);
  const escapeAttempt = await api('/files', 'POST', { action: 'read', path: '../../etc/passwd' });
  assert.equal(escapeAttempt.status, 400);

  const create = await api('/files', 'POST', {
    action: 'create', path: 'nota.txt', content: 'conteudo privado de teste', confirmed: true
  });
  assert.equal(create.status, 202);
  const createTask = (await create.json()).task;
  assert.equal(createTask.status, 'awaiting_confirmation');
  assert.equal(createTask.confirmation.details.preview, 'conteudo privado de teste');
  assert.equal(createTask.confirmation.details.byteLength, Buffer.byteLength('conteudo privado de teste'));
  await assert.rejects(access(path.join(managedDirectory, 'nota.txt')));

  const auditBeforeApproval = await readFile(path.join(testDirectory, 'automation', 'audit.jsonl'), 'utf8');
  assert.equal(auditBeforeApproval.includes('conteudo privado de teste'), false);

  const decision = await api(`/tasks/${createTask.id}/decision`, 'POST', { approved: true });
  assert.equal(decision.status, 202);
  const deadline = Date.now() + 3000;
  let createdTask;
  while (Date.now() < deadline) {
    const response = await api('/tasks', 'GET');
    const data = await response.json();
    createdTask = data.tasks.find(task => task.id === createTask.id);
    if (createdTask?.status === 'completed' || createdTask?.status === 'failed') break;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.equal(createdTask?.status, 'completed', createdTask?.error);
  assert.equal(await readFile(path.join(managedDirectory, 'nota.txt'), 'utf8'), 'conteudo privado de teste');

  const removeRequest = await api('/files', 'POST', { action: 'delete', path: 'nota.txt', confirmed: true });
  const removeTask = (await removeRequest.json()).task;
  assert.equal(removeTask.status, 'awaiting_confirmation');
  const rejected = await api(`/tasks/${removeTask.id}/decision`, 'POST', { approved: false });
  assert.equal(rejected.status, 200);
  assert.equal(await readFile(path.join(managedDirectory, 'nota.txt'), 'utf8'), 'conteudo privado de teste');

  const pendingWrite = await api('/files', 'POST', {
    action: 'create', path: 'cancelado.txt', content: 'não deve ser gravado', confirmed: true
  });
  const pendingTask = (await pendingWrite.json()).task;
  assert.equal(pendingTask.status, 'awaiting_confirmation');
  assert.equal((await api('/stop', 'POST', {})).status, 200);
  const stopped = await api('/tasks', 'GET');
  assert.equal((await stopped.json()).tasks.find(task => task.id === pendingTask.id).status, 'cancelled');
  await assert.rejects(access(path.join(managedDirectory, 'cancelado.txt')));

  const terminal = await api('/terminal/run', 'POST', { command: 'pwd' });
  assert.equal(terminal.status, 202);
  assert.equal((await terminal.json()).task.category, 'terminal');

  const browserEnabled = await api('/permissions/browser', 'PATCH', { enabled: true, confirmed: true });
  assert.equal(browserEnabled.status, 200);
  const localDomain = await api('/scopes/browser', 'POST', { origin: 'https://127.0.0.1', confirmed: true });
  assert.equal(localDomain.status, 400);
  const ungrantedOrigin = await api('/browser/navigate', 'POST', { url: 'https://chatgpt.com/' });
  assert.equal(ungrantedOrigin.status, 400);

  await api('/stop', 'POST', {});
  await api('/permissions/files', 'PATCH', { enabled: false });
  await api('/permissions/terminal', 'PATCH', { enabled: false });
  await api('/permissions/browser', 'PATCH', { enabled: false });
});
