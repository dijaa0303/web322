require('dotenv').config();
require('pg');
const { Sequelize } = require('sequelize');

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

const Op = Sequelize.Op;


function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({
    include: [Sector]   
  });
}

function getProjectById(projectId) {
  return Project.findAll({
    include: [Sector],
    where: { id: projectId }
  }).then(data => {
    if (data.length > 0) {
      return data[0];
    } else {
      throw "Unable to find requested project";
    }
  });
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Op.iLike]: `%${sector}%`
      }
    }
  }).then(data => {
    if (data.length > 0) {
      return data;
    } else {
      throw "Unable to find requested projects";
    }
  });
}

function getAllSectors() {
  return Sector.findAll();
}

function addProject(projectData) {
  delete projectData.id;

  return Project.create(projectData)
    .then(() => { })
    .catch(err => {
      throw err.errors[0].message;
    });
}
function editProject(id, projectData) {
  delete projectData.id; // don’t let user change the id

  return Project.update(projectData, {
    where: { id }
  })
    .then(() => { })
    .catch(err => {
      throw err.errors[0].message;
    });
}

function deleteProject(id) {
  return Project.destroy({
    where: { id }
  })
    .then(() => { })
    .catch(err => {
      throw err.errors[0].message;
    });
}


module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};
