/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Khadija Baig Student ID: 183789239 Date: 5th December 2025
*
* Published URL:
*
********************************************************************************/
require('dotenv').config();
const express = require('express');
const path = require('path');
const clientSessions = require('client-sessions');
const projects = require('./modules/projects');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// client-sessions middleware
app.use(clientSessions({
  cookieName: 'session',
  secret: process.env.SESSIONSECRET,
  duration: 2 * 60 * 60 * 1000,      // 2 hours
  activeDuration: 30 * 60 * 1000     // extend by 30 mins on activity
}));

// make session available to all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => res.render('home', { title: 'Climate Solutions' }));
app.get('/about', (req, res) => res.render('about', { title: 'About' }));

app.get('/solutions/projects', async (req, res) => {
  try {
    const { sector } = req.query;

    const projectList = sector
      ? await projects.getProjectsBySector(sector)
      : await projects.getAllProjects();

    res.render('projects', { projects: projectList });
  } catch (e) {
    res.status(404).render('404', { message: String(e) });
  }
});
app.get('/solutions/projects/:id', async (req, res) => {
  try {
    const project = await projects.getProjectById(req.params.id);
    res.render('project', { project });
  } catch (e) {
    res.status(404).render('404', { message: String(e) });
  }
});


app.get('/solutions/editProject/:id', ensureLogin, async (req, res) => {
  try {
    const project = await projects.getProjectById(req.params.id);
    res.render('editProject', { project, message: "" });
  } catch (e) {
    res.status(404).render('404', { message: String(e) });
  }
});


app.post('/solutions/editProject', ensureLogin, async (req, res) => {
  try {
    await projects.editProject(req.body.id, req.body);
    res.redirect('/solutions/projects');
  } catch (e) {
    const project = await projects.getProjectById(req.body.id);
    res.render('editProject', { project, message: e });
  }
});


app.get('/solutions/deleteProject/:id', ensureLogin, async (req, res) => {
  try {
    await projects.deleteProject(req.params.id);
    res.redirect('/solutions/projects');
  } catch (e) {
    res.render('500', {
      message: `I'm sorry, but we have encountered the following error: ${e}`
    });
  }
});

app.get('/solutions/addProject', ensureLogin, (req, res) => {
  console.log("GET /solutions/addProject");   // debug log
  res.render('addProject', { message: "" });
});


app.post('/solutions/addProject', ensureLogin, async (req, res) => {
  console.log("POST /solutions/addProject", req.body);  // debug log
  try {
    await projects.addProject(req.body);
    res.redirect('/solutions/projects');
  } catch (e) {
    res.render('addProject', {
      message: `I'm sorry, but we have encountered the following error: ${e}`
    });
  }
});

// show login form
app.get('/login', (req, res) => {
  res.render('login', { errorMessage: "", userName: "" });
});

// handle login submit
app.post('/login', (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  if (userName === process.env.ADMINUSER && password === process.env.ADMINPASSWORD) {
    // success: store user in session
    req.session.user = {
      userName: process.env.ADMINUSER
    };
    res.redirect('/solutions/projects');
  } else {
    // failed: show error
    res.render('login', {
      errorMessage: "Invalid username or password.",
      userName
    });
  }
});

// logout route
app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});


app.use((req, res) =>
  res.status(404).render('404', { message: "I'm sorry, we're unable to find what you're looking for." })
);

projects.initialize()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server listening on port 8080");
    });
  })
  .catch(err => {
    console.log("Unable to start server: " + err);
  });



