var socket = io.connect('http://localhost:8000');

socket.on('buildJSON_done', function(){	
	$('#systemStatus').html('<h3>JSON build done</h3>');	
	showStatus(2500);
	socket.removeAllListeners('buildJSON_done');
});
socket.on('convert_done', function(){	
	$('#systemStatus').html('<h3>CSV file created</h3>');
	showStatus(2500);
	socket.removeAllListeners('convert_done');
});
socket.on('buildDB_done', function(){	
	$('#systemStatus').html('<h3>Database generation complete</h3>');
	showStatus(2500);
	socket.removeAllListeners('buildDB_done');
});
socket.on('noJSONfile', function(){
	$('#systemStatus').html('<h3>Error: Must build JSON before converting to CSV</h3>');
	showStatus(5000);
	socket.removeAllListeners('noJSONfile');
});
socket.on('noDB', function() {
	$('#systemStatus').html('<h3>Error: Must build database before reading tweets</h3>');
	showStatus(5000);
	socket.removeAllListeners('noDB');
});
socket.on('overwritingJSON', function() {
	$('#systemStatus').html('<h3>Overwriting existing JSON file...</h3>');
	showStatus(2500);
	socket.removeAllListeners('overwritingJSON');
});

function showStatus(fadeTime)
{
	$('#systemStatus').css('visibility', 'visible');
	$('#systemStatus').fadeOut(fadeTime, function(){
		$('#systemStatus').css('visibility', 'hidden');
	});
}