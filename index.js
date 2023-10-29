const mongoose = require("mongoose");
require("./config/db");
const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const router = require("./routes");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const Handlebars = require("handlebars");

require("dotenv").config({ path: "variables.env" });
const expressValidator = require("express-validator");
//const { check, validationResult } = require("express-validator");
const flash = require("connect-flash");
const createError = require("http-errors");
const passport = require("./config/passport");

const app = express();

// validación de campos
app.use(expressValidator());
// app.post(
//   "/user",
//   validationResult,
//   [check("title", "title cannot be empty").notEmpty()],
//   (req, res, next) => {}
// );

// habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// habilitar handlebars como view
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "layout",
    helpers: require("./helpers/handlebars.js"),
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

// static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// inicializar passport
app.use(passport.initialize());
app.use(passport.session());  

// Alertas y flash messages
app.use(flash());

// Crear nuestro middleware
app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  next();
});

app.use("/", router());

 // 404 pagina no existente
app.use((req, res, next) => {
  next(createError(404, "No Encontrado"));
}); 

// Administración de los errores
app.use((error, req, res) => {
  res.locals.mensaje = error.message;
  const status = error.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render("error");
});  

// //Dejar que Heroku asigne el puerto
// const host = '0.0.0.0';
// const port = process.env.PORT;
// app.listen(port, host, ()=>{
//   console.log('El servidor está funcionando')
// })
app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.listen(process.env.PUERTO);
// //app.listen(5000);
