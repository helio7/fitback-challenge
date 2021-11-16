const { Sequelize } = require('sequelize');

const DB_DIALECT = process.env.DB_DIALECT;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;

function connect_sequelize () {
   let uri = `${DB_DIALECT}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`;
   if (DB_NAME) uri += `/${DB_NAME}`;
   return new Sequelize(uri, {
      logging: (msg) => {
         console.log(`\n${msg}\n`);
      }
   });
}

module.exports = connect_sequelize;
