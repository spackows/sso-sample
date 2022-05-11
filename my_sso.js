
const g_saml2 = require( "saml2-js" );

const g_sp = new g_saml2.ServiceProvider( { entity_id        : process.env.ENTITYID,
                                            private_key      : process.env.SPKEY,
                                            certificate      : process.env.SPCERT,
                                            assert_endpoint  : process.env.ENTITYID + "/postResponse",
                                            allow_unencrypted_assertion : true
                                          } );

const g_idp = new g_saml2.IdentityProvider( { sso_login_url : process.env.SSOLOGINURL,
                                              certificates  : [ process.env.IDPCERT ]
                                            } );

                                      
var exports = module.exports = {};


exports.login = function( response )
{
    console.log( "my_sso.login ..." );
    //console.log( "my_sso.login g_sp:\n"  + JSON.stringify( g_sp,  null, 3 ) );
    //console.log( "my_sso.login g_idp:\n" + JSON.stringify( g_idp, null, 3 ) );
    
    g_sp.create_login_request_url( g_idp, {}, function( login_err, login_url, request_id )
    {
        //console.log( "create_login_request_url: login_err:\n"  + login_err );
        //console.log( "create_login_request_url: login_url:\n"  + login_url );
        //console.log( "create_login_request_url: request_id:\n" + request_id );

        if( login_err )
        {
            var msg = "create_login_request_url failed";
            console.log( msg );
            console.log( login_err );
            response.writeHead( 500 );
            response.end( msg + " : " + login_err );
            return;
        }
        
        console.log( "create_login_request_url redirecting ..." );
        response.redirect( login_url );

    } );
    
}


exports.handleSSOResponse = function( request, callback )
{
    var func_name = "my_sso.handleSSOResponse";
    
    console.log( func_name + " ..." );
    
    if( !request || !request["body"] )
    {
        var msg = "No body found in response from SSO";
        console.log( func_name + ": " + msg );
        callback( msg, null );
        return;
    }
    
    var options = { request_body: request["body"] };
    //console.log( func_name + ": options:\n"  + JSON.stringify( options, null, 3 ) );

    g_sp.post_assert( g_idp, options, function( assert_err, saml_response )
    {            
        if( assert_err )
        {
            var msg = "sp.post_assert failed";
            console.log( func_name + ": " + msg );
            console.log( assert_err );
            callback( msg, null );
            return;
        }

        // Grab whatever attributes you want...
        var attributes = saml_response ? ( saml_response.user ? ( saml_response.user.attributes ? saml_response.user.attributes : null ) : null ) : null;
        //console.log( func_name + ": attributes:\n" + JSON.stringify( attributes, null, 3 ) );
        callback( null, attributes );
        
  } );
      
}

