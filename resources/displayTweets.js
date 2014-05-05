var tweetCount = 5; 
var timeZoneCount = 5; 
var timeZoneArray = new Array();

//Check to see if any of the profile images in the tweets are null
for(var i = 0; i < tweetsToDisplay.length; i++)
{
	if(tweetsToDisplay[i].profile_image_url == null)
	{	
		tweetsToDisplay[i].profile_image_url = "defaultPic.gif";
	}
}

//Draw each chart
drawHashTagChart();		
drawCharacterCountChart();
drawLanguageChart();

//Fill the div's with the first 5 tweets
$('#t0').html('<img src="' + tweetsToDisplay[0].profile_image_url + '" />' + tweetsToDisplay[0].text);
$('#t1').html('<img src="' + tweetsToDisplay[1].profile_image_url + '" />' + tweetsToDisplay[1].text);
$('#t2').html('<img src="' + tweetsToDisplay[2].profile_image_url + '" />' + tweetsToDisplay[2].text);
$('#t3').html('<img src="' + tweetsToDisplay[3].profile_image_url + '" />' + tweetsToDisplay[3].text);
$('#t4').html('<img src="' + tweetsToDisplay[4].profile_image_url + '" />' + tweetsToDisplay[4].text);

//Instead of hash tags like in Lab1, show timezones
for (var i = 0; i < tweetsToDisplay.length; i++) {
	if(tweetsToDisplay[i].time_zone != null)
	{				
		timeZoneArray.push(tweetsToDisplay[i].time_zone);		
	}
};

//Fill the div's with the first 5 timezones
$('#h0').html(timeZoneArray[0]);
$('#h1').html(timeZoneArray[1]);
$('#h2').html(timeZoneArray[2]);
$('#h3').html(timeZoneArray[3]);
$('#h4').html(timeZoneArray[4]);

setInterval(function(){ loadTweets() }, 3000);
setInterval(function(){ loadTimeZones() }, 3000);

function loadTweets()
{
	//Animate top tweet, then remove it once the animation is done
	$('#tweets > div:first').hide("slow", function() { $('#tweets > div:first').remove(); });	

	//Add new tweet at the bottom 
	$('#tweets').append('<div class="eachTweet">' + '<img src="' + tweetsToDisplay[tweetCount].profile_image_url + '" />'
	                     + tweetsToDisplay[tweetCount].text + '</div>');	

	//Reset the count if we get to the end
	tweetCount++;
	if(tweetCount == tweetsToDisplay.length - 1)
		tweetCount = 0;
}

function loadTimeZones()
{
	//Animate top hashtag, then remove it once the animation is done
	$('#timezones > div:first').hide("slow", function() { $('#timezones > div:first').remove(); });	

	//Add new hashtag at the bottom 
	$('#timezones').append('<div class="eachTimezone">' + timeZoneArray[timeZoneCount] + '</div>');	

	//Reset the count if we get to the end
	timeZoneCount++;
	if(timeZoneCount == timeZoneArray.length)
		timeZoneCount = 0;			
}

function drawHashTagChart()
{
	var hashTagData = new Array(); 
	hashTagData[0] = ['numHashtags', ''];	
	hashTagData[1] = ['0', 0];
	hashTagData[2] = ['1', 0];
	hashTagData[3] = ['2', 0];
	hashTagData[4] = ['3', 0];
	hashTagData[5] = ['4', 0];
	hashTagData[6] = ['5', 0];
	hashTagData[7] = ['6', 0];

	//Loop through tweets and see how many hash tags each has
	for(var i = 0; i < tweetsToDisplay.length; i++)
	{
		switch(tweetsToDisplay[i].hashtags.length)
		{
			case 0:
				hashTagData[1][1]++; 
				break;
			case 1:
				hashTagData[2][1]++;
				break;
			case 2:
				hashTagData[3][1]++;
				break;
			case 3:
				hashTagData[4][1]++;
				break;
			case 4:
				hashTagData[5][1]++;
				break;
			default:
				break;
		}	
	}

	google.load("visualization", "1", {packages:["corechart"]});
	google.setOnLoadCallback(drawChart);

	function drawChart() {
	  var data = google.visualization.arrayToDataTable(hashTagData);

	  var options = {
	    title: 'Number of hashtags per tweet',
	    hAxis: {title: 'Number of hashtags', titleTextStyle: {color: 'red'}},
	    vAxis: {title: 'Hashtag Frequency', titleTextStyle: {color: 'red'}}    
	  };

	  var chart = new google.visualization.ColumnChart(document.getElementById('hashTagChart'));
	  chart.draw(data, options);
	}
}

function drawCharacterCountChart()
{
    characterCountData = new Array();
    characterCountData[0] = ['numChars', 'frequency'];
    characterCountData[1] = ['0-25',    0];
    characterCountData[2] = ['26-50',   0];
    characterCountData[3] = ['51-75',   0];
    characterCountData[4] = ['76-100',  0];
    characterCountData[5] = ['101-120', 0];
    characterCountData[6] = ['121-140', 0];

    //Loop through tweets and categorize by their length
    for(var i = 0; i < tweetsToDisplay.length; i++)
    {
    	if(tweetsToDisplay[i].text.length < 25)
    	{
    		characterCountData[1][1]++;
    	}
    	else if(tweetsToDisplay[i].text.length < 50)
    	{
    		characterCountData[2][1]++;
    	}
    	else if(tweetsToDisplay[i].text.length < 75)
    	{
    		characterCountData[3][1]++;
    	}
    	else if(tweetsToDisplay[i].text.length < 100)
    	{
    		characterCountData[4][1]++;
    	}
    	else if(tweetsToDisplay[i].text.length < 120)
    	{
    		characterCountData[5][1]++;
    	}
    	else // < 140
    	{
    		characterCountData[6][1]++;
    	}
    }

    google.load("visualization", "1", {packages:["corechart"]});
    google.setOnLoadCallback(drawChart);
    function drawChart()
    {
	    var data = google.visualization.arrayToDataTable(characterCountData);

	    var options = {
	      title: 'Number of characters per tweet',
	      pieHole: 0.2,
	    };

	    var chart = new google.visualization.PieChart(document.getElementById('characterCountChart'));
	    chart.draw(data, options);
    }
    
}

function drawLanguageChart()
{
	languageData = new Array();
	languageData[0] = ['Language', 'numTweets'];
	languageData[1] = ['Portugese', 0];
	languageData[2] = ['Italian', 0];
	languageData[3] = ['Spanish', 0];
	languageData[4] = ['Turkish', 0];
	languageData[5] = ['English', 0];
	languageData[6] = ['Korean', 0];
	languageData[7] = ['French', 0];
	languageData[8] = ['Russian', 0];
	languageData[9] = ['German', 0];
	languageData[10] = ['Japanese', 0];

	//Loop through tweets and categorize by language
	for(var i = 0; i < tweetsToDisplay.length; i++)
    {
    	if(tweetsToDisplay[i].lang == "pt")
    	{
    		languageData[1][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "it")
    	{
    		languageData[2][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "es")
    	{
    		languageData[3][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "tr")
    	{
    		languageData[4][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "en")
    	{
    		languageData[5][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "ko")
    	{
    		languageData[6][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "fr")
    	{
    		languageData[7][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "ru")
    	{
    		languageData[8][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "de")
    	{
    		languageData[9][1]++;
    	}
    	if(tweetsToDisplay[i].lang == "ja")
    	{
    		languageData[10][1]++;
    	}
    	
    }

	google.load("visualization", "1", {packages:["corechart"]});
	google.setOnLoadCallback(drawChart);
	function drawChart() 
	{
		var data = google.visualization.arrayToDataTable(languageData);

		var options = {
		  title: 'Tweet Languages'
		};

		var chart = new google.visualization.PieChart(document.getElementById('languageChart'));
		chart.draw(data, options);
	}
}