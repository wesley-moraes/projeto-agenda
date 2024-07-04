//MONTANDO UM SERVIDOR NODE!
const express = require('express');
const app = express();
const routes = require('./routes')
const path = require('path');
const {middlewareGlobal, checkCsrfError, csrfMiddleware} = require('./src/middleware/middleware');
const helmet = require('helmet');
const csrf = require('csurf');

require('dotenv').config();

const mongoose = require('mongoose')

mongoose.connect(process.env.CONNECTIONSTRING)
.then(() =>{
    app.emit('pronto');
})
.catch(e =>{console.log(e)});

const session = require('express-session'); //salva a sessão na memória
const MongoStore = require('connect-mongo');
const flash = require('connect-flash'); 

//helmet pode ser executado em qualquer momentp
app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  )

app.use(
    express.urlencoded(
        {
            extended: true
        }
    )
)
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

//Session
const sessionOptions = session({
    secret: 'QUalquer coisa que ninguem sabe o que e',
    //store: new MongoStore({mongooseConnection: mongoose.connection}),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 24 * 7,
        httpOnly: true
    },
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING})
});

app.use(sessionOptions);
app.use(flash());

//Views
app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());
//Próprios Middleware
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes); //Aqui é para usar as rotas! Deixar visível para ser usado

app.on('pronto', ()=>{
    app.listen(3000, () =>{
        console.log('Acessar http://localhost:3000');
        console.log('Servidor executando na porta 3000');
    });
});