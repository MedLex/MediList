var globalNaam;
var globalDate;
var globalID;
var globalDeleteAll;
var globalDeleteLists;

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
//		tx.executeSql ('DROP TABLE IF  EXISTS person');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY ASC,'
														    + 'naam TEXT,'
														    + 'gebJaar INTEGER,'
															+ 'gebMaand INTEGER,'
															+ 'gebDag INTEGER,'
															+ 'selected INTEGER)');
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

function showList (db)
{
	getSelectedPerson (db);
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
		getSelectedPerson (db);
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

function getSelectedPerson (db)
{
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				document.getElementById ('itemHeader').innerHTML = '<b>Medicatielijst van ' + row['naam'] + '</b>';
			}
			else
				document.getElementById ('itemHeader').innerHTML = '<b>Nog niemand geselecteerd</b>';
		}), function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
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
	var i = div.length;
	while (i--)
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
				
				div.className = 'personLine large ' + colorName;
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

				action = document.createElement ('div');
				if (row['selected'])
					action.className = 'personSelected ' + colorName;
				else
					action.className = 'personUnselected ' + colorName;
				action.setAttribute('onmouseup', 'selectPerson(' + row['id'] + ');');
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
					var dateString = date.getFullYear() + '-' + month + '-' + day;
					
					document.getElementById ('indiNaam').value = row['naam'];
					document.getElementById ('indiGeboren').value = dateString;
					document.getElementById ('individualText').innerHTML = 'wijzigen gegevens';
					document.getElementById ('individualButton').setAttribute ('onmouseup', 'indiOK (' + row['id'] + ');');
					setVisibility ('individualCover', true);
					setVisibility ('individual', true);
					document.getElementById ('individualCover').style.opacity = '0.4';
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

function plus ()
{
	var individual;
	
	individual = document.getElementById ('individual');
	setVisibility ('individualCover', true);
	setVisibility ('individual', true);
	document.getElementById ('individualText').innerHTML = 'nieuwe gebruiker';
	document.getElementById ('indiNaam').value = '';
	document.getElementById ('indiGeboren').value = '';
	document.getElementById ('individualButton').setAttribute ('onmouseup', 'indiOK (-1);');
	document.getElementById ('indiNaam').focus();
	document.getElementById ('individualCover').style.opacity = '0.4';
	if (individual)
	{
		individual.style.opacity = '1';
	}
}


function indiOK (id)
{
	var individual;
	var geboren;

	globalNaam    = document.getElementById ('indiNaam').value;
	geboren = document.getElementById ('indiGeboren').value;
	globalDate = new Date (geboren);
	globalID = id;
	
	if (geboren == '')
	{
		myAlert ('Er is nog geen geboortedatum ingevuld');
		return ;
	}
	if (globalNaam == '')
	{
		myAlert ('Er is nog geen naam ingevuld');
		return ;
	}
	
	db.transaction(function(tx)
	{
		var sqlStatement;
		
		if (globalID == -1)
			sqlStatement = 'INSERT INTO person (naam, gebJaar, gebMaand, gebDag) VALUES (\'' + globalNaam + '\', ' + globalDate.getFullYear() + ', ' + globalDate.getMonth() + ', ' + globalDate.getDate () + ')';
		else
			sqlStatement = 'UPDATE person SET naam = \'' + globalNaam + '\', gebJaar = ' + globalDate.getFullYear() + ', gebMaand = ' + globalDate.getMonth() + ', gebDag = ' + globalDate.getDate() + ' WHERE id = ' + globalID;
		tx.executeSql(sqlStatement, [], function ()
		{
		}, function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		});
	});
	
	var persons = document.getElementById ('persons');

	fillPersons (persons);

	indiCancel ();							// Sluit de vensters
}

function indiCancel ()
{
	
	document.getElementById ('individual').style.opacity = '0';
	document.getElementById ('individualCover').style.opacity = '0';
	setTimeout(function()
	{
		setVisibility ('individual', false);
		setVisibility ('individualCover', false);
	}, 500);
}

function deleteOK (id)
{
	var individual;
	var row;
	var aantal = 1;
	
	if (   !globalDeleteAll
	    && !globalDeleteLists)
	{
		myAlert ('U hebt niets aangegeven om te verwijderen');
	}
	else if (globalDeleteAll)
	{
		db.transaction(function(tx)
		{
			tx.executeSql('SELECT * FROM lijsten WHERE patient = ' + id, [], function (tx, results)
			{
				aantal = results.rows.length;
			}), function (error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
//				alert ('namen gelezen en verwerkt');
			};
			tx.executeSql('SELECT * FROM person WHERE id = ' + id, [], function (tx, results)
			{
				if (results.rows.length < 1)
					myAlert ('Oeps, er is geen gebruiker gevonden met id '+ id);
				else
				{
					row = results.rows.item(0);
					var question = 'weet u zeker dat u\r\n\'' + row['naam'] + '\'\r\nwilt verwijderen';
					if (aantal != 0)
						question += '\r\ninclusief ' + aantal + ' medicatielijsten';
					question += '?';
					var r = confirm (question);
					if (r == true)
					{
						tx.executeSql('DELETE FROM person WHERE id = ' + id, [], function (tx, results)
						{
						}), function (error)
						{
							alert ('er is een fout opgetreden\r\n' + error.message);
						}, function ()
						{
						};
						var persons = document.getElementById ('persons');
					
						fillPersons (persons);
					}
				}
			}), function (error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
//				alert ('namen gelezen en verwerkt');
			};
		});
		deleteCancel ();				// haal het scherm weg
	}
	if (   globalDeleteLists			// Alleen medicatielijsten weg
		|| globalDeleteAll)				// Of persoon inclusief de lijsten
	{
		db.transaction(function(tx)
		{
			tx.executeSql('DELETE FROM lijsten WHERE patient = ' + id, [], function (tx, results)
			{
			}), function (error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
				alert (id + ' medicatielijsten verwijderd');
			};
		});
		deleteCancel ();				// haal het scherm weg
	}
}

function deletePerson (id)
{
	var individual;
	var row;
	var aantal = 1;
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM lijsten WHERE patient = ' + id, [], function (tx, results)
		{
			aantal = results.rows.length;
		}), function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
//			alert ('namen gelezen en verwerkt');
		};
		tx.executeSql('SELECT * FROM person WHERE id = ' + id, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, er is geen gebruiker gevonden met id '+ id);
			else
			{
				row = results.rows.item(0);
				var szQuestion;
				
				globalDeleteAll   = false;
				globalDeleteLists = false;
				szQuestion = 'Weet u  zeker dat u de gegevens van ' + row['naam'] + ' wilt verwijderen?';
				document.getElementById ('deleteQuestion').innerHTML = szQuestion;
				szQuestion = aantal + ' medicatielijsten';
				document.getElementById ('iconDeleteAll').className = 'unchecked';
				document.getElementById ('iconDeleteLists').className = 'unchecked';
				document.getElementById ('deleteListsText').innerHTML = szQuestion;
				document.getElementById ('deleteIndividual').setAttribute('onmouseup','deleteOK(' + id + ');');
				setVisibility ('individualCover', true);
				setVisibility ('individualDelete', true);
				var individual = document.getElementById ('individualDelete');
				document.getElementById ('individualCover').style.opacity = '0.4';
				if (individual)
				{
					individual.style.opacity = '1';
				}
				else
					alert ('kan individualDelete niet vinden');
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

function deleteCancel ()
{
	var individual;
	
	document.getElementById ('individualDelete').style.opacity = '0';
	document.getElementById ('individualCover').style.opacity = '0';
	setTimeout(function()
	{
		setVisibility ('individualDelete', false);
		setVisibility ('individualCover', false);
	}, 500);
}

function onClickDeleteAll ()
{
	
	if (globalDeleteAll)
	{
		globalDeleteAll = 0;
		document.getElementById ('iconDeleteAll').className = 'unchecked';
	}
	else
	{
		globalDeleteAll = 1;
		document.getElementById ('iconDeleteAll').className = 'checked';
	}
}

function onClickDeleteLists ()
{
	
	if (globalDeleteLists)
	{
		globalDeleteLists = 0;
		document.getElementById ('iconDeleteLists').className = 'unchecked';
	}
	else
	{
		globalDeleteLists = 1;
		document.getElementById ('iconDeleteLists').className = 'checked';
	}
}

function selectPerson (id)
{
	var selected;
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT id, selected FROM person', [], function (tx, results)
		{
			for (var i = 0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				if (row['id'] == id)
					selected = 1;
				else
					selected = 0;
				tx.executeSql('UPDATE person SET selected = ' + selected + ' WHERE id = ' + row['id'], [], function (tx, results)
				{
				}), function (error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};
			}
		}), function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
//			alert ('namen gelezen en verwerkt');
		};
	});

	var persons = document.getElementById ('persons');
	fillPersons (persons);
}
