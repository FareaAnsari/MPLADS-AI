const http = require('http');

const ROUTES = [
  '/',
  '/projects',
  '/projects/board',
  '/projects/WS-1',
  '/sandbox',
  '/investigate/1',
  '/ai-insights',
  '/contractors',
  '/vendors',
  '/tenders',
  '/contracts',
  '/funds',
  '/reports',
  '/mps',
  '/mps/ls-355',
  '/citizen',
  '/about',
  '/decision-support',
  '/decision-support?role=MP',
  '/decision-support?tab=overruns',
  '/decision-support?tab=quotas',
  '/decision-support?tab=delays',
  '/decision-support?tab=splitting',
  '/rural-intelligence',
  '/village-explorer',
  '/village-priority',
  '/village-data-quality',
  '/opportunities',
  '/contractor-interest',
  '/contractor-dashboard',
  '/supply-chain',
  '/tender-sources',
  '/national-data'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:5173${route}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const hasRoot = data.includes('id="root"');
        const pass = res.statusCode === 200 && hasRoot;
        resolve({
          route,
          status: res.statusCode,
          hasRoot,
          pass
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        route,
        status: 'ERROR',
        error: err.message,
        pass: false
      });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        route,
        status: 'TIMEOUT',
        pass: false
      });
    });
  });
}

async function run() {
  console.log('================ E2E ROUTE AUDIT ================');
  let passed = 0;
  let failed = 0;

  for (const r of ROUTES) {
    const res = await checkRoute(r);
    if (res.pass) {
      passed++;
      console.log(`[PASS] ${r} -> HTTP ${res.status} (SPA Root OK)`);
    } else {
      failed++;
      console.log(`[FAIL] ${r} -> Status: ${res.status}, Error: ${res.error || 'N/A'}`);
    }
  }

  console.log('================ SUMMARY ================');
  console.log(`Total Routes: ${ROUTES.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
