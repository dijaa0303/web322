/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Khadija Baig Student ID: 183789239 Date: 7th November 2025
*
* Published URL: ___________________________________________________________
*
********************************************************************************/
const express = require('express');
const path = require('path');
const { getAllProjects, getProjectById, getProjectsBySector } =
  require('./modules/project');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => res.render('home', { title: 'Climate Solutions' }));
app.get('/about', (req, res) => res.render('about', { title: 'About' }));

app.get('/solutions/projects', (req, res) => {
  try {
    const { sector } = req.query;
    const projects = sector ? getProjectsBySector(sector) : getAllProjects();
    res.render('projects', { projects });
  } catch (e) {
    res.status(404).render('404', { message: String(e) });
  }
});

app.get('/solutions/projects/:id', (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    res.render('project', { project });
  } catch (e) {
    res.status(404).render('404', { message: String(e) });
  }
});

app.use((req, res) =>
  res.status(404).render('404', { message: "I'm sorry, we're unable to find what you're looking for." })
);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));


