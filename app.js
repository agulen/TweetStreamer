var http = require('http'); 		//Used for server creation
var express = require('express');	//Used for express
var fs = require('fs');				//Used for JSON file creation
var twitter = require('ntwitter');	//Used for getting twitter stream
var mongo = require('mongodb'); 	//Host: localhost, Port: 27017
var mongojs = require('mongojs');	//Emulates Mongo API

var databaseUrl = 'example';
var collections = ["tweetsCollection"]
var db = mongojs(databaseUrl, collections);

var app = express(); 

//Twitter API token
var twit = new twitter({
	consumer_key: 'lPsEG5TceJEaKNb85OvQ',
	consumer_secret: '6WkHzyehZrNUi9abp9AFyXD24qCILTyTiu53klvQ',
	access_token_key: '2372874818-ycpFnKhqX1ldx72ZVybJXwgl5XmiTBrGfpjNbH4',
	access_token_secret: 'iULhFJcOB0naq9gt7TY0T5Av3VbBqs9ZqD0v1D8kwZa4d'
});

var tweetCounter = 0; 
var databaseTweets;		//Will store tweets pulled from database
var tweets = [];		//Stores tweets pulled from stream	
var tweetCap = 15; 		//Number of tweets to get from stream

app.use(express.static(__dirname + '/resources'));

//Start button page
app.get('/', function(req, res) {
	res.sendfile(__dirname + '/resources/start.html');
});

//Button panel page
app.post('/start', function(req, res) {	
	//Clear any existing documents in database
	db.tweetsCollection.remove();
	
	//Stream twitter and put into mongoDB
	getTwitterStream(false);
	
	//Show tweet visualization!	
	res.sendfile(__dirname + '/resources/lab8.html');
});

//If user clicks Build JSON File button
app.post('/buildJSON', function(req, res) {		
	db.tweetsCollection.remove();	//Remove previous documents in db
	res.sendfile(__dirname + '/resources/lab8.html');
	getTwitterStream(true);
});

//If user clicks Convert to CSV button
app.post('/convert', function(req, res) {	
	res.sendfile(__dirname + '/resources/lab8.html');
	JSONtoCSV();	
});

//If user clicks Build Database button
app.post('/buildDB', function(req,res) {		
	db.tweetsCollection.remove();	//Remove previous documents in db
	res.sendfile(__dirname + '/resources/lab8.html');
	getTwitterStream(false);
});

//If user clicks Read Tweets button
app.post('/read', function(req,res) {		
	//Pull all tweets from database
	db.tweetsCollection.find(function(err, docs) {				
		var buffer = [];
		buffer[0] = new Buffer('var tweetsToDisplay = ', 'utf-8'); 			//Treat data like a variable
		buffer[1] = new Buffer(JSON.stringify(docs, null, '\t'), 'utf-8');  //Add documents from database
		var combinedBuffer = Buffer.concat(buffer);
		fs.writeFileSync('resources/databaseTweets.js', combinedBuffer); //Write to a file in same directory	
																		 //as displayTweets.html		
	});																	 

	res.sendfile(__dirname + '/resources/displayTweets.html');
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8000); 

console.log('Listening on port %d', server.address().port);

/*Looks at twitter stream, grabs relevant tweets, and inserts into mongoDB or JSON file depending on bool parameter*/
function getTwitterStream(isJSON)
{
	console.log('getTwitterStream');
	tweets = [];
	tweetCounter = 0;	
	
	twit.stream('statuses/sample', function(stream) 
	{
		stream.on('data', function(data) 
		{				
			if(isJSON) //Generating JSON file
			{
				fs.open('tweets.json', 'a', null, function(error, fd) 
				{
					if(error)
					{
						console.log(error);
					}
					else
					{						
						tweets[tweetCounter] = data;

						//Stringify for pretty JSON formatting
						buffer = new Buffer(JSON.stringify(data, null, '\t'), 'utf-8');
						fs.writeSync(fd, buffer, null, buffer.length, null);  //Write to the file
						fs.closeSync(fd)
						console.log('Writing JSON - tweet #' + tweetCounter);

						tweetCounter++;	
						//Limit file to a specific number of tweets
						if(tweetCounter > tweetCap)
						{	
							console.log('Done writing.');							
							tweetCounter = 0;																					
							stream.destroy();
						}
					}
				});		
			}
			else
			{
				tweets[tweetCounter] = data; 				
				console.log('Inserting to database - tweet #' + tweetCounter);
				tweetCounter++;

				if(tweetCounter > tweetCap)
				{
					console.log('Over limit');
					for(var i = 0; i < tweets.length; i++)
					{	
						db.tweetsCollection.insert({
							"id" : tweets[i].id,
							"created_at" : tweets[i].created_at,
							"text" : tweets[i].text,
							"user_id" : tweets[i].user.id,
							"user_name" : tweets[i].user.name,
							"screen_name" : tweets[i].user.screen_name,
							"location" : tweets[i].user.location,
							"followers_count" : tweets[i].user.followers_count,
							"friends_count" : tweets[i].user.friends_count,
							"user_created_at" : tweets[i].user.user_created_at,
							"time_zone" : tweets[i].user.time_zone,
							"profile_background_color" : tweets[i].profile_background_color,
							"profile_image_url" : tweets[i].user.profile_image_url,
							"geo" : tweets[i].geo,
							"coordinates" : tweets[i].coordinates,
							"place" : tweets[i].place,
							"hashtags" : tweets[i].entities.hashtags,
							"lang" : tweets[i].lang
						}
						, function(err, doc) {
							if(err)
							{
								console.log('Error with building database');
								console.log(err);
							}							
						});
					}					
					
					console.log('Done writing to database');	
					tweetCounter = 0;
					stream.destroy();
				}
			}
			
			
		});	
		stream.on('end', function(res) {

		});
		stream.on('destroy', function(res) {
			console.log('Stream destroyed');
			getMongoTweets();
		});
	});
}

/*Pulls tweets stored in mongo database and writes them to a JS file*/
function getMongoTweets()
{	
	db.tweetsCollection.find().toArray(function(err, docs) {		
		//If nothing is stored in the database, show error message in  browser
		if(docs == null)
		{
			io.sockets.on('connection', function(socket) {
				socket.emit('noDB');
			});			
		}
		else
		{
			console.log('Creating databaseTweets.js');
			var buffer = [];
			buffer[0] = new Buffer('var tweetsToDisplay = ', 'utf-8'); 			//Treat data like a javascript variable
			buffer[1] = new Buffer(JSON.stringify(docs, null, '\t'), 'utf-8');  //Add documents from database
			var combinedBuffer = Buffer.concat(buffer);
			fs.writeFileSync('resources/databaseTweets.js', combinedBuffer); //Write to a file in same directory	
		}																	 //as displayTweets.html		
	});																	 	
}

/*Converts JSON file filled with tweet data to CSV file*/
function JSONtoCSV()
{
	//Check if JSON file exists before trying to convert
	if(fs.existsSync('tweets.json'))
	{
		var headerRow = "created_at,id,text,user_id,user_name,user_screen_name,user_location,user_followers_count,user_friends_count,user_created_at,user_time_zone,user_profile_background_color,user_profile_image_url,geo,coordinates,place\r\n";
		fs.open('tweets.csv', 'w', null, function(error, fd) 
		{
			if(error)
			{
				console.log(error);					
			}
			else
			{
				buffer = new Buffer(headerRow, 'utf-8');
				fs.writeSync(fd, buffer, null, buffer.length, null);
				
				//Loop through tweets and extract data specific data
				for(var i = 0; i < tweets.length; i++)
				{
					console.log('Converting tweet #' + i);
					var line = ''; 
					line += "\"" + tweets[i].created_at + "\",";
					line += tweets[i].id + ',';
					line += "\"" + tweets[i].text + "\",";
					line += tweets[i].user.id + ',';
					line += "\"" + tweets[i].user.name + "\",";
					line += "\"" + tweets[i].user.screen_name + "\",";
					line += "\"" + tweets[i].user.location + "\",";
					line += tweets[i].user.followers_count + ',';
					line += tweets[i].user.friends_count + ',';
					line += "\"" + tweets[i].user.created_at + "\",";
					line += tweets[i].user.time_zone + ',';
					line += tweets[i].user.profile_background_color + ',';
					line += tweets[i].user.profile_image_url + ',';
					line += tweets[i].geo + ',';
					line += tweets[i].coordinates + ',';
					line += tweets[i].place + ',';
					line += "\r\n";

					buffer = new Buffer(line, 'utf-8');
					fs.writeSync(fd, buffer, null, buffer.length, null);
				}

				fs.closeSync(fd);
				console.log('Done converting.');		
				io.sockets.on('connection', function(socket) {
					socket.emit('convert_done');
				});
			}
		});
	}
	else
	{				
		io.sockets.on('connection', function(socket) {
			socket.emit('noJSONfile');
		});	
	}	
}
