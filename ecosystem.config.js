module.exports = {
    apps: [
      {
        name: "API-DIARIAAQUI",
        script: "ts-node src/server.ts",
        instances: "max",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
          PORT: 3001
        }
      }
    ]
  };
  