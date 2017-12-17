'use strict';
var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var router = express.Router();

const child_process = require('child_process'); //Ejecución
var ps = require('ps-node'); //Información del procesador
var fs = require('fs'); //Ficheros
var os = require('os-utils'); 

var uso_cpu=0;
var porcentaje =0;
var sum= 0

router.post('/clase', function (req, res) {
    var nombre = req.body.nom;
    var codigo = req.body.cod;
    console.log(nombre);
    console.log(codigo);

    fs.writeFile('./' + nombre, codigo, function (err) {
        if (err) {
            return console.log(err);//si el archivo no se pudo guardar
        }
    });
});


/* GET home page. */
router.get('/', function (req, res) {
    res.render('login', { mensaje: '' });
});

router.get('/registrar', function (req, res) {
    res.render('registrar', { mensaje: '' });
});

router.get('/repositorio', function (req, res) {
    
    var ejec = 0;
    var stanby = 0;
    var sleep = 0;
    var zombie = 0;
    var stopped = 0;


    child_process.exec('ps -A -o pid,user,state,%mem,command', (err, stdout, stdin) => {
        if (err) console.log(err);
        var jsonArr = [];
        var lines = stdout.split('\n');
        for (var i = 1; i < lines.length; i++) {
          
          var line = lines[i].trim();
          var pid = line.split(' ')[0];
          
          line = line.substring(pid.length, line.length).trim();
          var user = line.split(' ')[0];
          
          line = line.substring(user.length, line.length).trim();
          var state = line.split(' ')[0];
          
          line = line.substring(state.length, line.length).trim();
          var mem = line.split(' ')[0];
          
          line = line.substring(mem.length, line.length).trim();
          var command = line;
          jsonArr.push({'pid':pid, 'user':user, 'state':state, 'mem':mem, 'name':command});
        }

  

        for(var i = 0; i < jsonArr.length; i++){
          switch(jsonArr[i].state.toLowerCase()){
            case 'r':
                ejec++;
              break;

            case 'd':
                stanby++;
              break;

            case 's':
                sleep++;
              break;

            case 'z':
                zombie++;
              break;

            case 't':
                stopped++;
              break;
          }
        }
        console.log(jsonArr);
        var t = ejec + stanby + sleep + zombie + stopped;
        var val = [];
        val.push({'total':t ,'ejecucion':ejec, 'no_dormido':stanby, 'dormido':sleep, 'zombie':zombie, 'detenido':stopped});
        res.render('repositorio', {datos:jsonArr, val:val});
      });
    //res.render('repositorio');
});

router.post('/', function (req, res) {
    var usuario = req.body.usuario.trim();
    var contrasenia = req.body.contrasenia.trim();

    if (usuario == 'admin' && contrasenia == 'admin'){
        console.log('Acceso Login');
        res.redirect('/repositorio');
        
    }
    else{
        console.log('Acceso Denegado Login');        
        res.render('login', { mensaje: 'Usuario - Contraseña no Coinciden' });        
    }
});


router.get('/eliminar', function (req, res) {
        var idProceso = req.query['id'];
        console.log(idProceso);
        ps.kill( idProceso, function( err ) {
            if (err) {
                throw new Error( err );
            }
            else {
                console.log( 'Proceso KILL!', idProceso);
                res.redirect('/repositorio');
            }
        });
});


router.get('/graph', function (req, res) {
    var lastIdle = 0;
    var lastSum = 0;
    var jsonArr = [];

    os.cpuUsage(function(v){
        uso_cpu = v;
      });        
   

    fs.readFile('/proc/stat', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      var lines = data.split('\n');
      var line = lines[0].trim();   

      var cpu = line.split(' ')[0];
      line = line.substring(cpu.length, line.length).trim();

      var col1 = line.split(' ')[0];
      line = line.substring(col1.length, line.length).trim();

      var col2 = line.split(' ')[0];
      line = line.substring(col2.length, line.length).trim();
      
      var col3 = line.split(' ')[0];
      line = line.substring(col3.length, line.length).trim();

      var idle = line.split(' ')[0];
      line = line.substring(idle.length, line.length).trim();

      var col5 = line.split(' ')[0];
      line = line.substring(col5.length, line.length).trim();
      
      var col6 = line.split(' ')[0];
      line = line.substring(col6.length, line.length).trim();
      
      var col7 = line.split(' ')[0];
      line = line.substring(col7.length, line.length).trim();
      
      var col8 = line.split(' ')[0];
      line = line.substring(col8.length, line.length).trim();

      var col9 = line.split(' ')[0];
      line = line.substring(col9.length, line.length).trim();

      var col10 = line.split(' ')[0];
      line = line.substring(col10.length, line.length).trim();

      sum = col1 + col2 + col3 + idle + col5 + col6 + col7 + col8 + col9 + col10;
      porcentaje = (idle/sum)*100;
      console.log('% PROC ' + porcentaje); 
    });
  
    var total_memoria = os.totalmem();
    var memoria_usada = os.totalmem() - os.freemem();
    var porcentaje_memoria_libre = (memoria_usada/total_memoria)*100;
   
    console.log('uso_cpu ' + uso_cpu);
    console.log('total memoria ' + total_memoria);
    console.log('memoria usada ' + memoria_usada);
    console.log('porcentaje memoria libre ' + porcentaje_memoria_libre);

    jsonArr.push({'CPU':uso_cpu, 'total_memoria':total_memoria, 'memoria_usada':memoria_usada, 'porcentaje_memoria_libre':porcentaje_memoria_libre});
    console.log(jsonArr);    
    
    res.send(jsonArr);
});

module.exports = router;
