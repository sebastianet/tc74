#!/usr/bin/env node

// web server to display local temperature

// versions
//  1.1.a - 20200707 - inici
//  1.1.b - 20200707 - python local, envio JSON
//  1.1.c - 20200710 - lectura python single byte
//  1.2.a - 20200714 - canvas, grafica temperatures
//  1.2.b - 20200714 - timeout per llegir del TC74

// pendent
//  *) detectar IP de qui es conecta
//  *) https://en.wikipedia.org/wiki/RRDtool

const express = require( 'express' )
const path    = require( 'path' ) ;
const http    = require( 'http' ) ;
let {PythonShell}  = require( 'python-shell' ) ;  

let app = express() ;

app.set( 'mPort', process.env.PORT || 8123 ) ;                   // save port to use in APP var
app.set( 'appHostname', require('os').hostname() ) ;             // save hostname
app.set( 'cfgLapse_Read_TC74', process.env.TO_TC74 || 15000 ) ;  // 15.000 msg 

// serve "filename" from "public" folder at the URL /:filename, or "index.html" if "/"
app.use( express.static( path.join( __dirname + '/public') ) ) ;   

// **** **** define own constants

var myVersio  = "1.2.b" ;

var Detalls   = 1 ;                                // control de la trassa que generem via "mConsole"

var python_options = {
  mode: 'text',
  pythonPath: '/usr/bin/python',
  pythonOptions: ['-u'],
  scriptPath: '/home/sag/tc74',                  // here we read just ONE time, /home/sag/python/i2c/tc74_read.py is continous
  args: [ 'value1', 'value2.jpeg', 'value3' ]    // possible arguments for python function
} ;

var my_Temperatures = {
  timestamp : Date.now(),
  valors: [ 14, 14, 13, 13, 13, 12, 12, 12, 12, 13, 16, 17,
            19, 22, 24, 25, 26, 25, 24, 22, 21, 19, 18, 16 ]
}

// array max size : 1 mostra / 15 seg, 4 mostres / 1 minut, 240 mostres / 1 hora, 5.760 mostres / 1 dia
const kMaxLength = 17280 ;  // lets store 3 days


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


function myTimeout_Do_Read_TC74 ( arg ) { // read temperature 

    var szOut = " >>> timeout llegir TC74. " ;
    mConsole( szOut ) ;

    PythonShell.run( 'tc74_read.py', python_options, function( err, results ) { // results is an array of messages collected during execution

        tc74_temp = String( results[0] ) ;                           // convert to string
        mConsole( "(+2) python temperature (" + tc74_temp + ")." ) ;                          
        var newLength = my_Temperatures.valors.push( tc74_temp ) ;       // add to the end
        if ( newLength > kMaxLength ) {                                  // if too large
            var elGone = my_Temperatures.valors.shift() ;                // then remove from the begin
//            mConsole( "removed (" + elGone + "), now lng is "+ my_Temperatures.valors.length ) ;
        } else {
            mConsole( newLength + "<=" + kMaxLength ) ;
        } ;
//        mConsole( "now has (" + my_Temperatures.valors.length + ") items." ) ;                          

    } ) ; // run PythonShell

} ; //


// **** **** catch client requests

app.get( '/api/dibuix_temperatures', function ( req, res ) { 
    res.send( my_Temperatures ) ;
} ) ;

app.get( '/get_temp', function ( req, res ) {

    var tc74_temp = -3 ;

//    szIP1 = req.connection.remoteAddress ;
//    szIP2 = req.ip ;
//    szIP3 = req.header( 'x-forwarded-for' )

    mConsole( '+++ /get temp, gimme json' ) ;
//    mConsole( '+++ /get temp, gimme json, ip1 ' + szIP1 + ', ip2 ' + szIP2 + ', ip3 ' + szIP3 ) ;

    PythonShell.run( 'tc74_read.py', python_options, function( err, results ) { // results is an array of messages collected during execution

        if ( err ) {                                                 // got error in python shell -> send a specific "error" pic

            var szErr = '--- Python error. ' ;
            szErr += 'Path (' + err.path + '). ' ;
            szErr += 'Stack (' + err.stack + '). ' ;
            console.log( szErr ) ;
            throw err ;                                              // fatal error : stop 

        } else {

//            var sz_PY_result = sprintf( '(+) Python results #1 are (%j).', results ) ;
//            mConsole( sz_PY_result ) ;                          
//            console.log( '(+) Python results #1 are (%j).', results ) ;

            tc74_temp = String( results[0] ) ;                           // convert to string
            mConsole( "(+1) python temperature (" + tc74_temp + ")." ) ;                          

            if ( tc74_temp > 1 ) {

                res.writeHead( 200, { 'Content-Type': 'application/json' }) ;
                let my_json = { status: 'OK', temp: tc74_temp } ;
                res.end( JSON.stringify( my_json ) ) ;

            } else { // no pic == filename = "."

                let my_json = { status: 'KO', temp: tc74_temp } ;
                res.end( JSON.stringify( my_json ) ) ;

            } ;

        } ; // no error

    } ) ; // run PythonShell

} ) ; // get( /get_temp ) 


// lets go

// (1) set timeout

setInterval( myTimeout_Do_Read_TC74, app.get( 'cfgLapse_Read_TC74' ) ) ;   // lets call own function every defined lapse


// (2) Write an initial message into console.

var szOut = "+++ +++ +++ +++ app TC74 temperature. Versio["+myVersio+"], " ;
szOut += "port["+app.get('mPort')+"], " ;
szOut += "HN["+app.get('appHostname')+"]." ;
mConsole( szOut ) ;


// (3) start server

http.createServer( app ).listen( app.get( 'mPort' ), function() {

    console.log( 'temperature server listening on port [' + app.get('mPort') + '].' ) ;

} ) ; // listen

