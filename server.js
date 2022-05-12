
const g_local_testing = process.env.LOCALTESTING; // If true, skips SSO

const g_express      = require( "express"       );
const g_cookieParser = require( "cookie-parser" );
const g_bodyParser   = require( "body-parser"   );

const g_sso = require( "./my_sso.js" );

var g_app = g_express();
g_app.use( g_express.static( __dirname + '/public' ) );
g_app.use( g_bodyParser.json() );
g_app.use( g_bodyParser.urlencoded( { extended: true } ) );
g_app.use( g_cookieParser() );
g_app.set( "view engine", "ejs" );


const PORT = 8080;
g_app.listen( 8080, function()
{
    console.log( "[server] Server running" );

} );


g_app.get( '/', function( request, response )
{
    console.log( "[server] / ..." );
    console.log( "[server] / cookies:\n" + JSON.stringify( request.cookies, null, 3 ) );
    
    var user_email = "None. ( Local testing )";
    
    if( !g_local_testing )
    {
        user_email = request ? ( request.cookies ? ( request.cookies.user_email ? request.cookies.user_email : "" ) : "" ) : "";
        
        if( !user_email )
        {
            g_sso.login( response );
            return;
        }
    }
    
    response.render( "pages/main", { "user_email" : user_email } );
    
} );


g_app.post( "/postResponse", function( request, response )
{
    console.log( "[server] /postResponse ..." );
    console.log( "[server] /postResponse body:\n"    + JSON.stringify( request.body,    null, 3 ) );
    console.log( "[server] /postResponse cookies:\n" + JSON.stringify( request.cookies, null, 3 ) );
    
    g_sso.handleSSOResponse( request, function( sso_err_str, user_email )
    {
        if( sso_err_str )
        {
            response.status( 200 ).end( sso_err_str );
            return;
        }
        
        console.log( "[server] /postResponse user_email:\n" + JSON.stringify( user_email, null, 3 ) );
        
        response.cookie( "user_email", user_email, { httpOnly: true, maxAge: ( 2 * 60 * 60 * 1000 ) }  );
        
        response.redirect( "../" );
        
    } );
    
} );









