const parse = require('pg-connection-string').parse;

// const config = parse("postgres://raman:K=G4H@zB<pm(&UVt@localhost:5432/rcp");

const config = {
  host:"localhost",
  port:5432,
  database:"strapIDB",
  user:"postgres",
  password:"instep",
}

module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user,
        password: config.password,
        // ssl: env.bool('DATABASE_SSL', false),
      },
      options: {
        // ssl: false,
      },
    },
  },
});