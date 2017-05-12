
function showMenu (vShow)
{
   	var vMenu = document.getElementById ('menuBox');
	
    if (vShow == 0)
    {
    	setVisibility ('menuCover', false);
    	menuBox.style.left  = '-70%';
    }
    else
    {
    	setVisibility ('menuCover', true);
    	menuBox.style.left  = '0px';
    }
}

/*
function buildOverzicht ()
{
	
	if (!isDeviceReady ())
	{
		alert ('Cordova is nog niet geladen....');
		return ;
	}
	var db = sqlitePlugin.openDatabase (
		{
			name: "medi.db",
			location: 'default'
		});
	initTables (db);
	db.executeSql ('select * from overzichten;', [], function (res)
	{
		for (var i=0; i < res.count; i++)
		{
			alert (res[i][0]);
		}
	});
	
	db.close ();
}
*/
function initTables (db)
{
	db.transaction (function (tx)
	{
		var id;
		var naam;
		var geboren;

		tx.executeSql ('DROP TABLE IF EXISTS Person');
		tx.executeSql ('DROP TABLE IF EXISTS List');
		tx.executeSql ('DROP TABLE IF EXISTS Line');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY ASC,'
														    + 'naam TEXT,'
														    + 'geboren TEXT)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS lijsten(id integer PRIMARY KEY ASC,'
														    + 'apotheek TEXT,'
		                                                    + 'datum TEXT,'
														    + 'patient INTEGER)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS medicatie  (lijst INTEGER,'
														    + 'regel INTEGER,'
		                                                    + 'datum TEXT,'
														    + 'voorschrijver TEXT'
															+ 'medicijn TEXT,'
															+ 'dosering TEXT,'
															+ 'start TEXT,'
															+ 'end TEXT,'
															+ 'duur INTEGER,'
															+ 'toediening TEXT,'
															+ 'toelichting TEXT,'
															+ 'herhaling INTEGER,'
														    + 'code TEXT)');
		id     [0] = 0;
		naam   [0] = 'Suzanna Smit';
		geboren[0] = '12-03-1982';
		id     [1] = 1;
		naam   [1] = 'Peter Herrewegen';
		geboren[1] = '11-06-1985';
		tx.executeSql ('INSERT INTO person (id, naam, geboren) VALUES (?, ?, ?)', [id, naam, geboren]);
	}, function (error)
	{
		alert ('er is een fout opgetreden\r\n' + error.message);
	}, function ()
	{
		alert ('tables created');
	});
}

function onShowMed (vIndex)
{
	if (vIndex == 1)
		ShowPrescription ('pantozaprol tablet msr 20mg',
	                        '<tr><td>Startdatum</td><td>:</td><td>18-09-2014</td></tr>'
	                      + '<tr><td>Stopdatum</td><td>:</td><td></td></tr>'
	                      + '<tr><td>Dosering</td><td>:</td><td>1 x per dag 40 milligram</td></tr>'
	                      + '<tr><td>Toelichting</td><td>:</td><td></td></tr>'
	                      + '<tr><td>Toediening</td><td>:</td><td>Oraal</td></tr>'
	                      + '<tr><td>Voorschrijver</td><td>:</td><td>Lorsheyd, A<br />CAR 03053035</td></tr>');
	else if (vIndex == 2)
		ShowPrescription ('carbasalaatcalcium bruistablet 100mg',
	                        '<tr><td>Startdatum</td><td>:</td><td>07-01-2013</td></tr>'
	                      + '<tr><td>Stopdatum</td><td>:</td><td></td></tr>'
	                      + '<tr><td>Dosering</td><td>:</td><td>1 x per dag 100 milligram</td></tr>'
	                      + '<tr><td>Toelichting</td><td>:</td><td></td></tr>'
	                      + '<tr><td>Toediening</td><td>:</td><td>Oraal</td></tr>'
	                      + '<tr><td>Voorschrijver</td><td>:</td><td>Lorsheyd, A<br />CAR 03053035</td></tr>');
	else if (vIndex == 3)
		ShowPrescription ('furosemide tablet 40mg',
	                        '<tr><td>Startdatum</td><td>:</td><td>08-09-2016</td></tr>'
	                      + '<tr><td>Stopdatum</td><td>:</td><td></td></tr>'
	                      + '<tr><td>Dosering</td><td>:</td><td>1 x per dag 100 milligram</td></tr>'
	                      + '<tr><td>Toelichting</td><td>:</td><td>Chronisch</td></tr>'
	                      + '<tr><td>Toediening</td><td>:</td><td>Oraal</td></tr>'
	                      + '<tr><td>Voorschrijver</td><td>:</td><td>Lorsheyd, A<br />CAR 03053035</td></tr>');
}

function onNfc(nfcEvent)
{
    // display the tag as JSON
    myAlert(JSON.stringify(nfcEvent.tag));
}

function nfcTagDetected (reading)
{
	myAlert (reading.tag.id); // alert the id of the NFC reading
}

// See more at: http://www.dogu.io/blog/technology/adding-rfid-capabilities-to-your-android-phonegap-application/#sthash.JQ1T8QKW.dpuf

function showPersons ()
{
	var persons;
	
	showMenu (false);
	persons = document.getElementById ('persons');
	
	if (persons)
	{
		setHeader ('gebruikers', 'Persons');
		persons.style.display = 'block';
		persons.style.opacity = '1';
		fillPersons (persons);
	}
}

function personsOK ()
{
	var persons;
	
	persons = document.getElementById ('persons');
	if (persons)
	{
		setHeader ('Medicatieoverzicht', 'Mortar');
		persons.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('persons', false);
		}, 500);
	}
}

function setHeader (szText, szImage)
{
	var header = document.getElementById ('headertext');
	var icon = document.getElementById ('vijzel');
	
	if (header && icon)
	{
		header.innerHTML = szText;
		icon.style.background = 'transparent url(\'img/' + szImage + '.png\') center no-repeat';
		icon.style.backgroundSize = '46px';
	}

}

function fillPersons (person)
{
	var id;
	var naam;
	var geboren;
	var div;
	
	div = person.getElementsByClassName ('personLine');
	for (var i = 0; i < div.length;i++)
	{
		person.removeChild (div[i]);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person', [id, naam, geboren]);
	});
	for (var i = 0; i < naam.length; i++)
	{
		div = document.createElement ('div');
		div.onmouseup = 'showPerson (\' + id[i] + \')';
		if (i%2)
			div.className = 'personLine standard50';
		else
			div.className = 'personLine standard200';
		var szHTML = geboren[i];
		szHTML += ', ';
		szHTML += naam[i];
		div.innerHTML = szHTML;
	}
}
