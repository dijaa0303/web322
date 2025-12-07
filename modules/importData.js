// modules/importData.js
require('dotenv').config();
require('pg');
const { Sequelize } = require('sequelize');

// same connection as in modules/projects.js
let sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectModule: require('pg'),
    port: 5432,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

// models (same as projects.js)
const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: Sequelize.STRING
}, {
  timestamps: false
});

const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING,
  sector_id: Sequelize.INTEGER
}, {
  timestamps: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// old JSON data
const rawProjectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

// remove "id" from each project so Postgres can create ids itself
const projectData = rawProjectData.map(p => {
  const { id, ...rest } = p; // take everything except id
  return rest;
});

// run import
sequelize.sync({ force: true })   // drops & recreates tables, then:
  .then(() => {
    return Sector.bulkCreate(sectorData);
  })
  .then(() => {
    return Project.bulkCreate(projectData);
  })
  .then(() => {
    console.log(" Data inserted successfully");
    process.exit();
  })
  .catch(err => {
    console.log(" Error inserting data:", err);
    process.exit(1);
  });
