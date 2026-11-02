let app = null;
let initError = null;

try {
  const mod = require('./dist/server.js');
  app = mod.default || mod;
} catch (err) {
  initError = err;
  console.error('[CRITICAL INIT ERROR]', err);
}

module.exports = (req, res) => {
  if (initError) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        error: 'Backend Initialization Failure',
        message: initError.message,
        stack: initError.stack,
      })
    );
  }

  try {
    const handler = app.default || app;
    return handler(req, res);
  } catch (runtimeErr) {
    console.error('[CRITICAL RUNTIME ERROR]', runtimeErr);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        error: 'Backend Runtime Failure',
        message: runtimeErr.message,
        stack: runtimeErr.stack,
      })
    );
  }
};
