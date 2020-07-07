
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
    var szAra = '<center> ./public/index.html - now is [' + genTimeStamp() + '] </center>' ;
    $( "#id_date" ).html( szAra ) ; // show actual date

} ; // index_ready(), DOM ready for INDEX.HTM

$( function() {

    index_ready(); // DOM ready event

} ) ; // DOM ready
