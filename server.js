const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const Contact = require('./models/contact');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Auth middleware
function checkAuth(req, res, next) {
  if (req.session.loggedIn) next();
  else res.redirect('/login');
}

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views/about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'views/services.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'views/gallery.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'views/contact.html')));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views/login.html')));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password123') {
    req.session.loggedIn = true;
    res.redirect('/admin');
  } else {
    res.send("Invalid credentials. <a href='/login'>Try again</a>");
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/admin', checkAuth, async (req, res) => {
  const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
  let tableRows = contacts.map(c => `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.message}</td><td>${c.createdAt}</td></tr>`).join('');
  res.send(`
    <h1>Admin Dashboard</h1>
    <a href="/logout">Logout</a>
    <table border="1"><tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr>
    ${tableRows}
    </table>
    <a href="/">Back</a>
  `);
});

app.post('/contact', async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password'
      }
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'your_email@gmail.com',
      subject: 'New Contact Submission',
      text: `Name: ${contact.name}\nEmail: ${contact.email}\nMessage: ${contact.message}`
    };

    await transporter.sendMail(mailOptions);

    res.send("<h2>Thank you for contacting us!</h2><a href='/'>Go back</a>");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving your message or sending email.");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
