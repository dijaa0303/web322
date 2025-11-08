const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise ((resolve, reject) => {
        try {
            projects = []; 
            projectData.forEach((p) => {
            const sectorObj = sectorData.find(s => s.id === p.sector_id);
            const sectorName = sectorObj ? sectorObj.sector_name : "Unknown";
        projects.push({ ...p, sector: sectorName });
        });
        resolve();
    }catch (err) {
        reject ("Unable to initialize projects: " + err);
    }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
      if (projects.length === 0) {
        reject("No projects available.");
      } else {
        resolve(projects);
      }
    });
  }

  function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
      const found = projects.find(p => p.id === projectId);
      if (found) {
        resolve(found);
      } else {
        reject("Unable to find project with id: " + projectId);
      }
    });
  }
  function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
      const needle = sector.toLowerCase();
      const filtered = projects.filter(p => p.sector.toLowerCase().includes(needle));
      if (filtered.length > 0) {
        resolve(filtered);
      } else {
        reject("Unable to find projects for sector: " + sector);
      }
    });
  }
  
  module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };