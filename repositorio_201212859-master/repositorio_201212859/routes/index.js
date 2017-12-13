'use strict';
var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var router = express.Router();
var usuarioActual;


var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "repositorio"
});

/* GET home page. */
router.get('/', function (req, res) {
    res.render('login', { mensaje: "" });
});

router.get('/registrar', function (req, res) {
    res.render('registrar', { mensaje: "" });
});

router.get('/repositorio', function (req, res) {
    conn.connect(function (err) {
        if (!err) {
            console.log("Connected!");
        }
        var sql = "select idclase, nombre, autor, url from clase";
        conn.query(sql, function (err, rows) {
            if (!err) {
                if (usuarioActual !== undefined) {
                    console.log(rows);
                    res.render("repositorio", { datos: rows, usr: usuarioActual });
                }
            }
        });
    });
});

router.post('/registrar', function (req, res) {
        console.log("Entro Registrar");
        var usuario = req.body.usuario.trim();
        var contrasenia = req.body.contrasenia.trim();
        var nombre = req.body.nombre.trim();
        console.log(usuario);
        console.log(contrasenia);
        console.log(nombre);

        conn.connect(function (err) {
            if (!err) {
                console.log("Connected!");
            }
            var sql = "insert into usuario values('" + usuario + "', '" + contrasenia + "', '" + nombre + "', 1)";
            conn.query(sql, function (err, result) {
                if (!err) {
                    res.render('login', {mensaje: "Usuario se ha registrado" });
                }
                else {
                    res.render('registrar',{mensaje: "Usuario ya Existe"});
                }
            });
        });
});

router.post('/', function (req, res) {
    console.log("Entro Registrar");
    var usuario = req.body.usuario.trim();
    var contrasenia = req.body.contrasenia.trim();
    console.log(usuario);
    console.log(contrasenia);
    usuarioActual = undefined;


    conn.connect(function (err) {
        if (!err) {
            console.log("Connected!");
        }
        var sql = "select * from usuario where usuario= '" + usuario + "' and contrasenia= '" + contrasenia + "'";
        conn.query(sql, function (err, rows) {
            if (!err) {
                if (rows.length > 0) {
                    usuarioActual = usuario;
                    res.redirect('/repositorio');
                }
                else {
                    res.render('login', { mensaje: "Usuario - Contraseña no Coinciden" });
                }
            }
        });
    });
});


router.get('/eliminar', function (req, res) {
    var id = req.query['id'];    
    conn.connect(function (err) {
        if (!err) {
            console.log("Connected!");
        }
        var sql = "delete from clase where idclase = " + id;
        conn.query(sql, function (err, result) {
            if (!err) {
                res.redirect('/repositorio');
            }
            else {
                console.log(err);
                return;
            }
        });
    });
});

router.get('/clase', function (req, res) {
    var id = req.query['id'];
    console.log("Entra Clase");
    console.log(id);

    conn.connect(function (err) {
        if (!err) {
            console.log("Connected!");
        }
        var sql = "select * from clase where idclase= " + id;
        conn.query(sql, function (err, rows) {
            if (!err) {
                console.log(rows);
                res.render("clase.html", { datos: rows });
            }
        });
    });
});


router.post('/clase', function (req, res) {
    var nombre = req.body.nom;
    var codigo = req.body.cod;
    console.log(nombre);
    console.log(codigo);

    fs.writeFile("./" + nombre, codigo, function (err) {
        if (err) {
            return console.log(err);//si el archivo no se pudo guardar
        }
    });
});


module.exports = router;
