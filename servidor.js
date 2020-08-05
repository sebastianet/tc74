#!/usr/bin/env node

// web server to display local temperature

// versions
//  1.1.a - 20200707 - inici
//  1.1.b - 20200707 - python local, envio JSON
//  1.1.c - 20200710 - lectura python single byte
//  1.2.a - 20200714 - canvas, grafica temperatures
//  1.2.b - 20200714 - timeout per llegir del TC74
//  1.2.c - 20200717 - 1 mesura cada 30 segons, millors missatges
//  1.2.d - 20200717 - .env
//  1.2.e - 20200719 - trassa dotenv (Pere)
//  1.2.f - 20200719 - trace used memory when reading single temperature
//  1.3.a - 20200803 - read 2nd temperature from SoC, store 4 days of data
//  1.3.b - 20200805 - send number of samples and period

// pendent
//  *) detectar IP de qui es conecta
//  *) https://en.wikipedia.org/wiki/RRDtool

// urls 
//   https://www.valentinog.com/blog/node-usage/ - memory usage 

const express = require( 'express' )
const path    = require( 'path' ) ;
const http    = require( 'http' ) ;
let {PythonShell}  = require( 'python-shell' ) ;  

// require( 'dotenv' ).config() ;
// console.log( require( 'dotenv' ).config( {debug: true} ) ) ; 
require( 'dotenv' ).config( {path:__dirname+'/.env'} ) ;                 // __dirname is the directory in which the currently executing script resides. 
// console.log( require( 'dotenv' ).config({path:__dirname+'/.env'}) ) ;

let app = express() ;

app.set( 'mPort', process.env.PORT || 1122 ) ;                         // save port to use in APP var - use 8123 as FO router
app.set( 'appHostname', require('os').hostname() ) ;                   // save hostname
app.set( 'cfgLapse_Read_TC74_i_SOC', process.env.TO_TC74 || 15000 ) ;  // 1 lectura cada 30.000 msg = 30 segons

// serve "filename" from "public" folder at the URL /:filename, or "index.html" if "/"
app.use( express.static( path.join( __dirname + '/public') ) ) ;   

// **** **** define own constants

var myVersio  = "1.3.b" ;

var Detalls   = 1 ;                                // control de la trassa que generem via "mConsole"

var python_options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: '/home/sag/tc74',                  // here we read just ONE time, /home/sag/python/i2c/tc74_read.py is continous
  args: [ 'value1', 'value2.jpeg', 'value3' ]    // possible arguments for python function
} ;

var my_Temperatures_tc74 = {
  timestamp : Date.now(),
  valors : [ 30 ]
}

var my_Temperatures_SoC = {
  timestamp : Date.now(),
  valors : [ 50 ]
}

// array max size : 1 mostra/15 seg, 4 mostres/1 minut, 240 mostres/1 hora, 5.760 mostres/1 dia, 17280 mostres/3 dies, 
// array max size : 1 mostra/30 seg, 2 mostres/1 minut, 120 mostres/1 hora, 2.880 mostres/1 dia, 8.640 mostres/3 dies, 11.520 mostres/4 dies
const kMaxLength = 11520 ;  // lets store 4 days

// **** **** define own functions

Date.prototype.yyyymmdd = function ( ) { 

     var yyyy = this.getFullYear().toString();                                    
     var mm   = (this.getMonth()+1).toString(); // getMonth() is zero-based         
     var dd   = this.getDate().toString();
     return yyyy + '/' + (mm[1]?mm:'0'+mm[0]) + '/' + (dd[1]?dd:'0'+dd[0]);

}; // yyyymmdd()

Date.prototype.hhmmss = function () {

     function fixTime(i) {
          return (i < 10) ? "0" + i : i;
     }
     var today = new Date(),
          hh = fixTime( today.getHours() ),
          mm = fixTime( today.getMinutes() ),
          ss = fixTime( today.getSeconds() ) ;
     var myHHMMSS = hh + ':' + mm + ':' + ss ;
     return myHHMMSS ;

} ; // hhmmss()
 
// get a timestamp
function genTimeStamp ( arg ) {

    var szOut = (new Date).yyyymmdd() + ' - ' + (new Date).hhmmss() ;
    return szOut ;

} ; // genTimeStamp()

// log output control
function mConsole ( szIn ) {

    if ( Detalls == 1 ) {
        console.log( genTimeStamp() + ' - ' + szIn ) ;
    } ;

} ; // mConsole()


function myTimeout_Do_Read_TC74_i_SOC ( arg ) { // read temperature 

    var szOut = " >>> timeout llegir TC74 i SOC. " ;
    mConsole( szOut ) ;

    PythonShell.run( 'tc74_read.py', python_options, function( err, results ) { // results is an array of messages collected during execution

        let tc74_1temp = String( results[0] ) ;                           // convert to string
        mConsole( "(+2) python TC74 temperature (" + tc74_1temp + ")." ) ;                          

        var newLength = my_Temperatures_tc74.valors.push( tc74_1temp ) ;  // add to the end
        if ( newLength > kMaxLength ) {                                   // if too large
            var elGone = my_Temperatures_tc74.valors.shift() ;            // then remove from the begin
        } ;

        PythonShell.run( 'soc_read.py', python_options, function( err, results ) { // results is an array of messages collected during execution

            let soc_1temp = String( results[0] ) ;
            mConsole( "(+2) python SOC temperature (" + soc_1temp + ")." ) ;                          
            newLength = my_Temperatures_SoC.valors.push( soc_1temp ) ;       // add to the end
            if ( newLength > kMaxLength ) {                                  // if too large
                var elGone = my_Temperatures_SoC.valors.shift() ;            // then remove from the begin
            } ;

        } ) ; // run PythonShell

    } ) ; // run PythonShell

} ; // myTimeout_Do_Read_TC74_i_SOC()


// **** **** catch client requests

app.get( '/api/dibuix_temperatures_TC74', function ( req, res ) { 

    my_Temperatures_tc74.timestamp = genTimeStamp() ;
    mConsole( ">>> enviem dades dibuix temperatures TC74, te (" + my_Temperatures_tc74.valors.length + ") items." ) ;                          
    res.send( my_Temperatures_tc74 ) ;

} ) ; // get ( /api/dibuix_temperatures/TC74 )

app.get( '/api/dibuix_temperatures_SOC', function ( req, res ) { 

    my_Temperatures_SoC.timestamp = genTimeStamp() ;
    mConsole( ">>> enviem dades dibuix temperatures SOC, te (" + my_Temperatures_SoC.valors.length + ") items." ) ;                          
    res.send( my_Temperatures_SoC ) ;

} ) ; // get ( /api/dibuix_temperatures/SOC )

app.get( '/get_temp', function ( req, res ) {

    let tc74_temp = -3 ;
    let soc_temp  = -4 ;

//    szIP1 = req.connection.remoteAddress ;
//    szIP2 = req.ip ;
//    szIP3 = req.header( 'x-forwarded-for' )

    mConsole( '+++ crida /get_temp des el client, gimme json' ) ;
//    mConsole( '+++ /get temp, gimme json, ip1 ' + szIP1 + ', ip2 ' + szIP2 + ', ip3 ' + szIP3 ) ;

    var usedMem = process.memoryUsage().heapUsed / 1024 / 1024 ;
    var usedMemMB = Math.round(usedMem * 100) / 100 ;
    var szOut = usedMemMB +` MB` ;                               // used memory -> client's status line

    PythonShell.run( 'tc74_read.py', python_options, function( err, results ) { // results is an array of messages collected during execution

        if ( err ) {     

            var szErr = '--- Python TC74 error. ' ;
            szErr += 'Path (' + err.path + '). ' ;
            szErr += 'Stack (' + err.stack + '). ' ;
            console.log( szErr ) ;
            throw err ;                                              // fatal error : stop 

        } else {

            tc74_temp = String( results[0] ) ;                           // convert python result to string

            PythonShell.run( 'soc_read.py', python_options, function( err, results ) { // results is an array of messages collected during execution

                if ( err ) {           

                    var szErr = '--- Python SOC error. ' ;
                    szErr += 'Path (' + err.path + '). ' ;
                    szErr += 'Stack (' + err.stack + '). ' ;
                    console.log( szErr ) ;
                    throw err ;                                              // fatal error : stop 

                } else {

                    soc_temp = String( results[0] ) ;

                    mConsole( "(+1) python temperature (" + tc74_temp + "/" + soc_temp + "), Used Memory (" + usedMemMB + ") MB." ) ;                          
                    res.writeHead( 200, { 'Content-Type': 'application/json' }) ;
                    let my_json = { status: 'OK', 
                                    temp_tc: tc74_temp, 
                                    temp_soc: soc_temp, 
                                    num_samples: kMaxLength,
                                    sampling_period: app.get( 'cfgLapse_Read_TC74_i_SOC' ) / 1000,  // send number of seconds
                                    szMemoria: szOut } ;
                    res.end( JSON.stringify( my_json ) ) ;

                } ; // no error

            } ) ; // run PythonShell

        } ; // no error

    } ) ; // run PythonShell

} ) ; // get( /get_temp ) 


// lets go

// (1) set timeout

setInterval( myTimeout_Do_Read_TC74_i_SOC, app.get( 'cfgLapse_Read_TC74_i_SOC' ) ) ;   // lets call own function every defined lapse

// (2) Write an initial message into console.

var szOut = "+++ +++ +++ +++ app TC74 i SOC temperature. Versio["+myVersio+"], " ;
szOut += "port["+app.get('mPort')+"], " ;
szOut += "timeout["+app.get('cfgLapse_Read_TC74_i_SOC')+"], " ;
szOut += "HN["+app.get('appHostname')+"]." ;
mConsole( szOut ) ;

// (3) start server

http.createServer( app ).listen( app.get( 'mPort' ), function() {

    console.log( 'temperature server listening on port [' + app.get('mPort') + '].' ) ;

} ) ; // listen

