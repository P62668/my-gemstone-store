// JS shim for seeding scripts that require ../utils/env
module.exports = {
  requireEnv: function(name) {
    const v = process.env[name];
    if (!v) {
      throw new Error(`Missing required environment variable: ${name}. Set ${name} in your environment or .env file.`);
    }
    return v;
  },
  getEnv: function(name, fallback) {
    return process.env[name] ?? fallback;
  }
};
