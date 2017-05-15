
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

function initTables (db)
{
	db.transaction (function (tx)
	{
		tx.executeSql ('DROP TABLE IF EXISTS person');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY ASC,'
														    + 'naam TEXT,'
														    + 'gebJaar INTEGER,'
															+ 'gebMaand INTEGER,'
															+ 'gebDag INTEGER)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS lijsten(id INTEGER PRIMARY KEY ASC,'
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
	}, function (error)
	{
		alert ('er is een fout opgetreden\r\n' + error.message);
	}, function ()							// Succes. Hoeven we niet meer te melden
	{
//		alert ('tables created');
	});
}

function populatePersons ()
{

	db.transaction (function (tx)
	{
		tx.executeSql ('INSERT INTO person VALUES (1, \'Suzanna Smit\', 1982, 3, 12)');
		tx.executeSql ('INSERT INTO person VALUES (2, \'Peter Herrewegen\', 1985, 6, 4)');
	}, function (error)
	{
		alert ('er is een fout opgetreden\r\n' + error.message);
	}, function ()
	{
//		alert ('tables populated');			// Succes, hoeven we niet meer te melden
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
		setVisibility ('load', true);
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
		setVisibility ('load', false);
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
	var action;
	var colorName;
	
	div = person.getElementsByClassName ('personLine');
	for (var i = 0; i < div.length;i++)
	{
		person.removeChild (div[i]);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person', [], function (tx, results)
		{
			for (var i = 0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				div = document.createElement ('div');
//				div.setAttribute('onmouseup', 'showPerson(' + row['id'] + ');');
				if (i%2)
					colorName = 'standard50';
				else
					colorName = 'standard200';
				
				div.className = 'personLine standard ' + colorName;
				var date = new Date (row['gebJaar'], row['gebMaand'], row['gebDag'], 5, 5, 5, 5)
				var day = date.getDate();
				if(day<10){ day="0"+day;}
				var month = date.getMonth()+1;
				if(month<10){ month="0"+month;}
				var szHTML = day + '-' + month + '-' + date.getFullYear();
				szHTML += ', ';
				szHTML += row['naam'];
				div.innerHTML = szHTML;
				
				action = document.createElement ('div');
				action.className = 'personDelete ' + colorName;
				action.setAttribute('onmouseup', 'deletePerson(' + row['id'] + ');');
				div.appendChild (action);

				action = document.createElement ('div');
				action.className = 'personEdit ' + colorName;
				action.setAttribute('onmouseup', 'editPerson(' + row['id'] + ');');
				div.appendChild (action);

				person.appendChild (div);
			}
		}), function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
//			alert ('namen gelezen en verwerkt');
		};
	});
}

function editPerson (id)
{
	var individual;
	var row;
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE id = ' + id, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, er is geen gebruiker gevonden met id '+ id);
			else
			{
				row = results.rows.item(0);

				individual = document.getElementById ('individual');
				if (individual)
				{
					var date = new Date (row['gebJaar'], row['gebMaand'], row['gebDag'], 5, 5, 5, 5)
					var day = date.getDate();
					if(day<10){ day="0"+day;}
					var month = date.getMonth()+1;
					if(month<10){ month="0"+month;}
					var dateString = day + '-' + month + '-' + date.getFullYear();
					
					document.getElementById ('indiNaam').value = row['naam'];
					document.getElementById ('indigeboren').value = dateString;
					document.getElementById ('individualHeader').innerHTML = 'wijzigen gegevens';
					setVisibility ('individualCover', true);
					setVisibility ('individual', true);
					individual.style.opacity = '1';
				}
			}
		}), function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
//			alert ('namen gelezen en verwerkt');
		};
	});
}

function showPerson (id)
{
	alert ('showing person with id = \'' + id + '\'');
}

function plus ()
{
	var individual;
	
	individual = document.getElementById ('individual');
	setVisibility ('individualCover', true);
	setVisibility ('individual', true);
	document.getElementById ('individualHeader').innerHTML = 'nieuwe gebruiker';
	document.getElementById ('indiNaam').value = '';
	document.getElementById ('indigeboren').value = '';
	if (individual)
	{
		individual.style.opacity = '1';
	}
}


function indiOK ()
{
	var individual;
	
	setVisibility ('individualCover', false);
	individual = document.getElementById ('individual');
	if (individual)
	{
		individual.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('individual', false);
		}, 500);
	}
}

function indiCancel ()
{
	var individual;
	
	setVisibility ('individualCover', false);
	individual = document.getElementById ('individual');
	if (individual)
	{
		individual.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('individual', false);
		}, 500);
	}
}
