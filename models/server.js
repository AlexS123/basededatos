let express = require("express");
let sha1 = require("sha1");
let session = require("express-session");//sessiones
let cookie = require("cookie-parser");//cookie

class Server {
    constructor(){
        this.app = express();
        this.port = process.env.PORT;

        this.middlewares();
        this.routes();
    }

    middlewares(){
        //Páginas estáticas
        this.app.use(express.static('public'));

        //View engine
        this.app.set('view engine', 'ejs');

        //sesiones//////////////////
        this.app.use(cookie());

        this.app.use(session({
            secret: "amar",
            saveUninitialized: true,
            resave: true
        }));
        ////////////////////////////
    }

    routes(){
        //Ruta hola
        this.app.get('/hola',(req, res) => {
            //session
            if (req.session.user){
                if (req.session.user.rol == 'admin'){
                    res.send("<h1 style='color: blue;'>Iniciaste como administrador</h1>");
                }
                else{
                    res.send("<h1 style='color: blue;'>Iniciaste como cliente</h1>");
                }
            }
            else{
                res.send("<h1 style='color: blue;'>ERROR NO HAS INICIADO SESIÓN!!!</h1>");
            }
        });

        //Ruta login
        this.app.get('/login', (req, res) => {
            let usuario = req.query.usuario;
            let contrasena = req.query.contrasena;

            //Cifrado hash sha1
            /////////////////////////////////////////
            let passSha1 = sha1(contrasena);
            /////////////////////////////////////////

            //////Conexión a MySQL
            let mysql = require('mysql');

            let con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "12345",
                database: "escuela"
            });

            con.connect(function(err) {
                if (err) throw err;
                console.log("Connected!");
                let sql = "select * from usuarios where nombre_usuario = '" + usuario + "'";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    if (result.length > 0)
                        if(result[0].contrasena == passSha1){
                            /////////////session///////////////////
                            let user = {
                                nam: usuario,
                                psw: contrasena,
                                rol: result[0].rol
                            };
                            req.session.user = user;
                            req.session.save();
                            ///////////////////////////////////////
                            res.render("inicio", {nombre: result[0].nombre_usuario,
                                rol: result[0].rol
                            });                            
                        }
                        else
                            res.render("login", {error : "Contraseña incorrecta!!"});
                    else
                    res.render("login", {error : "Usuario no existe!!"});
                });
            });
            ///////////////////////////////////////////////////////
        });

        //Ruta dar de baja alumnos
        

        //Ruta registrar
        this.app.get("/registrar", (req, res) => {          
            let mat = req.query.matricula;
            let nombre = req.query.nombre;
            let cuatri = req.query.cuatrimestre;
            
            //////Conexión a MySQL
            let mysql = require('mysql');

            let con = mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "12345",
                database: "escuela"
            });

            con.connect(function(err) {
                if (err) throw err;
                console.log("Connected!");
                let sql = "INSERT INTO alumno VALUES (" + mat + ",'" + nombre + "','" + cuatri +"')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    res.render("registrado", {mat: mat, nombre: nombre, cuatri: cuatri});
                    console.log("1 record inserted");
                });
            });
            ///////////////////////////////////////////////////////         
        });

    }

    listen(){
        this.app.listen(this.port, () => {
            console.log("http://127.0.0.1:" + this.port);
        });
    }
}

module.exports = Server;

