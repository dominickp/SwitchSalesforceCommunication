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
	var GetTokenAccessToken = s.getPropertyValue( "GetTokenAccessToken" );
	var GetServicePath = s.getPropertyValue( "ServicePath" );
	var GetTokenInstanceUrl = '"' + s.getPropertyValue( "GetTokenInstanceUrl" ) + GetServicePath + '"';

	var DebugLevel = s.getPropertyValue( "DebugLevel" );
	
	var PostKey1 = s.getPropertyValue( "AdditionalPostKey1" );
	var PostKey2 = s.getPropertyValue( "AdditionalPostKey2" );
	var PostValue1 = s.getPropertyValue( "AdditionalPostValue1" );
	var PostValue2 = s.getPropertyValue( "AdditionalPostValue2" );
	
	var ResponsePrivateDataKey = s.getPropertyValue( "ResponsePrivateDataKey" );

	
	// Get the job contents as a string
	//var jobFile = new File( job.getPath() );
	var shipmentNotification = File.read(job.getPath(), "UTF-8");
	if(DebugLevel == 1){
		job.sendToLog(2, "Shipment Notification");
		job.sendToLog(2, shipmentNotification);
	}

	// Clean up the request
	//shipmentNotification = shipmentNotification.trim(); // Trim whitespace
	shipmentNotification = shipmentNotification.replace(/(\r\n|\n|\r)/gm,""); // Remove all line-breaks
	shipmentNotification = shipmentNotification.replace('<?xml version="1.0"?>', ''); // Replace XML version line with nothing
	
	// Build pair strings
	var empty = '';
	var pair_1 = empty;
	var pair_2 = empty;
	
	if(PostKey1)	pair_1 = ' -F ' + PostKey1 + '="' +  PostValue1 + '"';
	if(PostKey2)	pair_2 = ' -F ' + PostKey2 + '="' +  PostValue2 + '"';
	
	// Set HTTP headers
	pair_3 = " -H '" + 'Authorization' + ": Bearer " +  GetTokenAccessToken + "'";
	pair_4 = ' -H "Content-Type: application/xml"';

	var data = " -d '<request>" + shipmentNotification + "</request>'";


	// Build shell script
	var script = 	'#!/bin/sh' + '\n\n' +
				 	'curl' + pair_1 + pair_2 + pair_3 + pair_4 + data + ' ' + GetTokenInstanceUrl + '\n' +
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
	
	// Write private data
	job.setPrivateData(ResponsePrivateDataKey, curlResponse);
	
	// Finish
	job.sendToData(1, job.getPath());
	job.sendToLog(1, temp_shell_script);
	
	// Log
	if(DebugLevel == 1){
		s.log(2, script);
		s.log(2, curlResponse);
		s.log(2, curlError);
		s.log(2, temp_shell_script);
	}
	
	
}