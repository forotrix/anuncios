module.exports = {
  apps: [
    {
      name: 'anuncios-api',
      cwd: './apps/api',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        API_PORT: '3000'
      }
    }
  ]
};
