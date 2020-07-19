// identify this code
var szVersio = 'v 1.1.a' ;

// nova funcio yymmdd de Date() - at client
Date.prototype.yyyymmdd = function () {                            
	var yyyy = this.getFullYear().toString() ;                                    
	var mm   = (this.getMonth()+1).toString() ; // getMonth() is zero-based         
	var dd   = this.getDate().toString() ;
	return yyyy + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + (dd[1]?dd:"0"+dd[0]) ;
} ; // yyyymmd

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
} ; // hhmmss


// get a timestamp
function genTimeStamp ( arg ) {

    var szOut = (new Date).yyyymmdd() + ' - ' + (new Date).hhmmss() ;
    return szOut ;

} ; // genTimeStamp()


function index_ready() {              // DOM ready for index.htm

    console.log( '*** (' + genTimeStamp() + ') *** index DOM ready.' ) ;

// posar la data actual a la pagina - aixi diferenciem re-loads
    var szAra = '<center> ./public/index.html - client.js versio {'+szVersio+'} - ara es [' + genTimeStamp() + '] </center>' ;
    $( "#id_date" ).html( szAra ) ; // show actual date

} ; // index_ready(), DOM ready for INDEX.HTM


$( "#butoLlegir" ).click( function() {

    console.log( '+++ (' + genTimeStamp() + ') +++ clicked Llegir temperatura' ) ;

    $.getJSON( '/get_temp', function( mi_json ) {

        console.log( '+++ (' + genTimeStamp() + ') +++ got JSON q {' + mi_json.status + '}.' ) ;

        if ( mi_json.status == "OK" ) {
            console.log( '+++ got {' + mi_json.temp + '}.' ) ;
            var szTemp = genTimeStamp() + ' *** la temperatura a casa meva es ' + mi_json.temp + ' ºC ***' ;
            $( "#id_temp" ).html( szTemp ) ;                                   // show error message at specific <div>
            $( "#id_estat" ).html( mi_json.memoria ) ;                         // show error message at specific <div>
        } else {
            var szError = genTimeStamp() + 'Error RxJSON ' + mi_json.status ;
            $( "#id_estat" ).html( szError ) ;                                 // show error message at specific <div>
        } ;
    } ) ;

} ) ; // buto "llegir temperatura"


const canvas = document.getElementById( 'my_graph' ) ;
const ctx = canvas.getContext('2d') ;
const MARGIN = 20 ;

function drawValues(values) {

    let rangeX = [ 0, values.length ];
    let rangeY = [ Math.max(...values), Math.min(...values) ];

    ctx.fillStyle = "#F0F0F0" ;                                       // or 'green'
    ctx.fillRect( 0, 0, canvas.width, canvas.height ) ;
    ctx.fillStyle = 'red' ;                                           // per les lletres de inici i final de rang

    ctx.fillText( rangeY[0], 0, MARGIN );
    ctx.fillText( rangeY[1], 0, canvas.height-MARGIN );
    ctx.fillText( rangeX[0], MARGIN, canvas.height );
    ctx.fillText( rangeX[1], canvas.width-2*MARGIN, canvas.height );

    function scaleInRange( val, range ){
      return  ( val - range[0] ) / ( range[1]-range[0]);
    }

    let valueToXY = (index,value) => [ 
      MARGIN + scaleInRange(index,rangeX)*(canvas.width-2*MARGIN),
      MARGIN + scaleInRange(value,rangeY)*(canvas.height-2*MARGIN) ];

    ctx.beginPath();
    ctx.moveTo(...valueToXY(0,values[0]));  
    for (let i = 0; i < values.length; i++)
      ctx.lineTo(...valueToXY(i,values[i]));
    ctx.stroke();

} ; // drawValues()


$( "#butoDibuixar" ).click( function() {

    console.log( '+++ (' + genTimeStamp() + ') +++ clicked Dibuixar temperatures' ) ;

//    $.getJSON( '/api/dibuix_temperatures', result => drawValues( result.valors ) ) ;
    $.getJSON( '/api/dibuix_temperatures', function( mi_json) {
        drawValues( mi_json.valors ) ;
        let szMarca = "### el dibuix s'ha fet a les ... " + mi_json.timestamp ;
        $( "#id_estat" ).html( szMarca ) ;            
    } ) ; // getJSON()

} ) ; // buto "dibuixar temperatures"


$( function() {

    index_ready(); // DOM ready event

} ) ; // DOM ready

