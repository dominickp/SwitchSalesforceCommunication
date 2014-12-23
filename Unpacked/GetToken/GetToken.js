/*    
  
,---.|                        |    
`---.|---.,---.. . .,-.-..   .|--- 
    ||   |,---|| | || | ||   ||    
`---'`   '`---^`-'-'` ' '`---'`---'
C o m m u n i c a t i o n s G r o u p

Author:	Shawmut Communications Group, Dominick G. Peluso
Date:		November 11, 2014

Copyright © 2014

DESCRIPTION NEEDED

*/

function jobArrived( s : Switch, job : Job )
{
	// Get user entered values
	var URL = '"' + s.getPropertyValue( "URL" ) + '"';
	var DebugLevel = s.getPropertyValue( "DebugLevel" );
	
	var Username = s.getPropertyValue( "Username" );
	var Password = s.getPropertyValue( "Password" );
	var ClientId = s.getPropertyValue( "Client_ID" );
	var ClientSecret = s.getPropertyValue( "Client_Secret" );
	
	var ResponseIdKey = s.getPropertyValue( "ResponseIdKey" );
	var ResponseIssuedAtKey = s.getPropertyValue( "ResponseIssuedAtKey" );
	var ResponseTokenTypeKey = s.getPropertyValue( "ResponseTokenTypeKey" );
	var ResponseInstanceUrlKey = s.getPropertyValue( "ResponseInstanceUrlKey" );
	var ResponseSignatureKey = s.getPropertyValue( "ResponseSignatureKey" );
	var ResponseAccessTokenKey = s.getPropertyValue( "ResponseAccessTokenKey" );
	
	// Build cURL request
	pair_1 = " -F username='" +  Username + "'";
	pair_2 = " -F password='" +  Password + "'";
	pair_3 = " -F client_id='" +  ClientId + "'";
	pair_4 = " -F client_secret='" +  ClientSecret + "'";
	pair_5 = " -F grant_type='password'";
	
	// Build shell script
	var script = 	'#!/bin/sh' + '\n\n' +
				 	'curl' + pair_1 + pair_2 + pair_3 + pair_4 + pair_5 + ' ' + URL + '\n' +
				 	'echo';
	
	// Make temp shell script file
	var temp_shell_script = job.createPathWithName( job.getNameProper() + '_exec.sh' );
	var shellFile = new File(temp_shell_script);
	
	// Write to shell script
	shellFile.open(File.WriteOnly);
	shellFile.write(script);
	shellFile.close();
	
	// Make the temp file writeable	
	var String args = new Array();
	args[0] = "chmod";
	args[1] = "777";
	args[2] = temp_shell_script;
	var exitStatus = Process.execute(args);
	
	// Process the temp shell script
	var String args = new Array();
	args[0] = temp_shell_script;
	var exitStatus = Process.execute(args);
	
	// Grab some variables
	var curlResponse = Process.stdout;
	var curlError = Process.stderr;
	
	// Parse the response as JSON
	var objJSON = eval("(function(){return " + curlResponse + ";})()");
	
	// Grab the response variables
	var r_id = objJSON.id;
	var r_instance_url = objJSON.instance_url;
	var r_signature = objJSON.signature;
	var r_access_token = objJSON.access_token;
	var r_token_type = objJSON.token_type;
	var r_issued_at = objJSON.issued_at;
	
	// Write to private data
	job.setPrivateData(ResponseIdKey, r_id);
	job.setPrivateData(ResponseIssuedAtKey, r_issued_at);
	job.setPrivateData(ResponseTokenTypeKey, r_token_type);
	job.setPrivateData(ResponseInstanceUrlKey, r_instance_url);
	job.setPrivateData(ResponseSignatureKey, r_signature);
	job.setPrivateData(ResponseAccessTokenKey, r_access_token);

	// Finish
	job.sendToData(1, job.getPath());
	job.sendToLog(1, temp_shell_script);
	
	// Log
	//if(DebugLevel == 1){
		s.log(2, "Response ID: " + r_id);
		s.log(2, "Response Instance URL: " + r_instance_url);
		s.log(2, "Response Signature: " + r_signature);
		s.log(2, "Response Access Token: " + r_access_token);
		s.log(2, script);
		s.log(2, curlResponse);
		s.log(2, curlError);
		s.log(2, temp_shell_script);
	//}
	
}