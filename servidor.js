#!/usr/bin/env node

// web server to display local temperature

const express = require( 'express' )
const path    = require( 'path' ) ;
const http    = require( 'http' ) ;

var app = express() ;

app.set( 'mPort', process.env.PORT || 8123 ) ;      // save port to use in APP var

// serve "filename" from "public" folder at the URL /:filename, or "index.html" if "/"
app.use( express.static( path.join( __dirname + '/public') ) ) ;   

http.createServer( app ).listen( app.get( 'mPort' ), function() {
    console.log( 'temperature express server v 1.0 listening on port [' + app.get('mPort') + '].' ) ;

} ) ; // listen

