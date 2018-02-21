var globalNaam;
var globalDate;
var globalID;
var screenID = 0;
var globalBirthDate;
var globalShowDate;
var globalURL;
var currentUser = '';
var receivedList = null;
var g_year;
var g_month;
var g_day;

function showMenu (vShow)
{
   	var vMenu = document.getElementById ('menuBox');
	
    if (vShow == 0)
    {
    	setVisibility ('menuCover', false);
		setVisibility ('load', true);
    	menuBox.style.left  = '-70%';
    }
    else
    {
    	setVisibility ('menuCover', true);
		setVisibility ('load', false);
    	menuBox.style.left  = '0px';
    }
}

function showPersons ()
{
	var persons;
	
	showMenu (false);
	persons = document.getElementById ('persons');
	screenID = 1;
	
	if (persons)
	{
		header = document.getElementById ('personsHeader');
		header.innerHTML = '<b>Gebruikers</b>';
		setVisibility ('menubutton', false);
		setVisibility ('back', true);
		persons.style.display = 'block';
		persons.style.opacity = '1';
		setVisibility ('load', true);
		fillPersons (persons);
	}
}

function back ()
{
	switch (screenID)
	{
	case 1:
		personsOK ();
		break;
	case 2:
		listsOK ();
		break;
	case 3:
		configOK ();
		break;
	case 4:
		calenderOK ();
		break;
	}
}

function personsOK ()
{
	var persons;
	
	persons = document.getElementById ('persons');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	screenID = 0;							// weer het medicatielijst scherm
	setVisibility ('load', true);
	if (persons)
	{
		persons.style.opacity = '0';
		showList (db);
		setTimeout(function()
		{
			setVisibility ('persons', false);
		}, 500);
	}
}

function listsOK ()
{
	var persons;
	
	persons = document.getElementById ('persons');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	screenID = 0;							// weer het medicatielijst scherm
	setVisibility ('load', true);
	if (persons)
	{
		persons.style.opacity = '0';
		showList (db);
		setTimeout(function()
		{
			setVisibility ('persons', false);
		}, 500);
	}
}

function showAllLists ()
{
	var lists;
	var header;

	screenID = 2;
	showMenu (false);
	lists = document.getElementById ('persons');
	
	if (lists)
	{
		header = document.getElementById ('personsHeader');
		if (currentUser == '')
			header.innerHTML = '<b>Er is nog geen gebruiker geselecteerd</b>';
		else
			header.innerHTML = '<b>Lijsten van ' + currentUser + '</b>';
		persons.style.display = 'block';
		persons.style.opacity = '1';
		setVisibility ('menubutton', false);
		setVisibility ('load', false);
		setVisibility ('back', true);
		lists.style.display = 'block';
		lists.style.opacity = '1';
		fillLists (lists);
	}
}

function showConfig ()
{
	var config;
	
	showMenu (false);
	setVisibility ('menubutton', false);
	config = document.getElementById ('config');
	
	if (config)
	{
		config.style.display = 'block';
		config.style.opacity = '1';
		setVisibility ('back', true);
		setVisibility ('load', false);
	}
	screenID = 3;
}

function configOK ()
{
	var config;
	
	saveSetting ('monthsSave', document.getElementById ('termijn').value);
	saveSetting ('largeFont', document.getElementById ('largeFont').className);

	config = document.getElementById ('config');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	setVisibility ('load', true);
	if (config)
	{
		config.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('config', false);
		}, 500);
	}
	screenID = 0;
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
				div.className = 'personLine large standardWhite';
				var date = new Date (row['gebJaar'], (row['gebMaand']-1), row['gebDag'], 5, 5, 5, 5)
				var day = date.getDate();
				if(day<10){ day="0"+day;}
				var month = date.getMonth()+1;
				if(month<10){ month="0"+month;}
				var szHTML = day + '-' + month + '-' + date.getFullYear();
				szHTML += ', ';
				szHTML += row['naam'];
				div.innerHTML = szHTML;
				
				action = document.createElement ('div');
				action.className = 'personDelete standardWhite';
				action.setAttribute('onmouseup', 'deletePerson(' + row['id'] + ');');
				div.appendChild (action);

				action = document.createElement ('div');
				action.className = 'personEdit standardWhite';
				action.setAttribute('onmouseup', 'editPerson(' + row['id'] + ');');
				div.appendChild (action);

				action = document.createElement ('div');
				if (row['selected'])
					action.className = 'personSelected standardWhite';
				else
					action.className = 'personUnselected ' + colorName;
				action.setAttribute('onmouseup', 'selectPerson(' + row['id'] + ');');
				div.appendChild (action);

				person.appendChild (div);
			}
			setFontSizes ();
		}), function (tx, error)
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
					var date = new Date (row['gebJaar'], (row['gebMaand']-1), row['gebDag'], 5, 5, 5, 5)
					var day = date.getDate();
					if(day<10){ day="0"+day;}
					var month = date.getMonth()+1;
					if(month<10){ month="0"+month;}
					var dateString = date.getFullYear() + '-' + month + '-' + day;
					
					document.getElementById ('indiNaam').value = row['naam'];
					document.getElementById ('indiGeboren').value = dateString;
					document.getElementById ('individualText').innerHTML = '<b>wijzigen gegevens</b>';
					document.getElementById ('individualButton').setAttribute ('onmouseup', 'indiOK (' + row['id'] + ',0);');
					setVisibility ('individualCover', true);
					setVisibility ('individual', true);
					setVisibility ('back', false);
					document.getElementById ('individualCover').style.opacity = '0.4';
					setVisibility ('load', false);
					individual.style.opacity = '1';
				}
			}
		}), function (tx, error)
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
	
	if (screenID == 0)						// medicatielijst
	{
		cordova.plugins.barcodeScanner.scan(
			function (result)
			{
				if (result.cancelled)
					myAlert ('Het lezen van de QR code is afgebroken');
				else
					handleQRCode (result.text);
			},
			function (error)
			{
				alert("Scanning failed: " + error);
			},
			{
				preferFrontCamera : false,		// iOS and Android
				showFlipCameraButton : true,	// iOS and Android
				showTorchButton : true,			// iOS and Android
				torchOn: false,					// Android, launch with the torch switched off
				saveHistory: true,				// Android, save scan history (default false)
				prompt : "Plaats de QR code binnen het scangebied", // Android
				resultDisplayDuration: 0,		// Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
				formats : "QR_CODE,PDF_417",	// default: all but PDF_417 and RSS_EXPANDED
				orientation : "unset",			// Android only (portrait|landscape), default unset so it rotates with the device
				disableAnimations : true,		// iOS
				disableSuccessBeep: false		// iOS and Android
			}
		);
	}
	else if (screenID == 1)					// gebruikers
	{
		individual = document.getElementById ('individual');
		setVisibility ('individualCover', true);
		document.getElementById ('individualCover').style.opacity = '0.4';
		setVisibility ('individual', true);
		document.getElementById ('individualText').innerHTML = '<b>Nieuwe gebruiker</b>';
		document.getElementById ('indiNaam').value = '';
		document.getElementById ('indiGeboren').value = '';
		document.getElementById ('indiGeboren').disabled = false;
		document.getElementById ('individualButton').setAttribute ('onmouseup', 'indiOK (-1,0);');
		document.getElementById ('indiNaam').focus();
		setVisibility ('back', false);
		if (individual)
		{
			individual.style.opacity = '1';
		}
	}
}

function getReadableDate (year, month, day)
{
	var months = [
		'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
		'september', 'oktober', 'november', 'december' ];
	var r = 'NaD2';

	if (month > 0 && month < 13)
		r = day + ' ' + months[month-1] + ' ' + year;

	return r;
}

function handleQRCode (QRCode)
{
	var actionCode = '?';
	var birthDate  = '?';
	var docType = 0;
	var url = '';
	var errorCode = 0;
	var listID = '';
	var parts = QRCode.split (';');

	if (   parts.length < 4
		|| parts.length > 5)
		errorCode = 1;
	else
	{
		actionCode = parseInt (parts[0]);
		docType    = parseInt (parts[1]);
		birthDate = parts[2];
		url = parts[3];
	
		var year  = parseInt (birthDate.substring (0, 4));
		var month = parseInt (birthDate.substring (4, 6));
		var day   = parseInt (birthDate.substring (6, 8));
		var current = new Date ();

		var bd = 'NaD1';
		if (   year  < 1900							// Dat geloven we niet!
		    || year  > current.getFullYear ()
			|| month < 1
			|| month > 12
			|| day   < 1
			|| day   > 31)							// OK, dit kan nauwkeuriger, maar voorlopig is dit wel voldoende
			errorCode = 2;
		else
			bd = getReadableDate (year, month, day);
		globalBirthDate = year + '-' + month + '-' + day;
		globalShowDate  = bd;
		
		if (parts.length == 5)
		{
			listID = parts[4];
			url += '?listID=' + listID;
		}
	
		if (actionCode != 1)
			errorCode = 3;
		else if (docType != 1)
			errorCode = 4;
	}
	if (errorCode != 0)
		myAlert ('Er is een onjuiste QR code gelezen.<br />Foutcode = 10' + errorCode);
	else
	{
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function()
		{
			if (   this.readyState == 4
				&& this.status == 200)
			{
				receivedList = JSON.parse(this.responseText);
				ProcessReceivedData ();
			}
			else if (this.readyState == 4)
			{
				if (this.status == 404)
					myAlert (  'De opgegeven medicatielijst voor de gebruiker met geboortedatum '
							 + globalShowDate
							 + ' kon niet worden gevonden of is verlopen');
				else
				{
//					myAlert ('Er is een fout opgetreden! (url = \'' + globalURL + '\'\r\nstatus = ' + this.status + ', ' + this.statusText + ')');
					receivedList = JSON.parse(this.responseText);
					ProcessReceivedData ();
				}
			}
		};

		globalURL = url;
		xhttp.open("GET", url, true);
		xhttp.send();
	}
}

function indiOK (id, qr)
{
	var individual;
	var geboren;

	globalNaam = document.getElementById ('indiNaam').value;
	geboren    = document.getElementById ('indiGeboren').value;
	globalDate = new Date (geboren);
	globalID   = id;

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
			sqlStatement = 'INSERT INTO person (naam, gebJaar, gebMaand, gebDag) VALUES (\'' + globalNaam + '\', ' + globalDate.getFullYear() + ', ' + (globalDate.getMonth()+1) + ', ' + globalDate.getDate () + ')';
		else
			sqlStatement = 'UPDATE person SET naam = \'' + globalNaam + '\', gebJaar = ' + globalDate.getFullYear() + ', gebMaand = ' + (globalDate.getMonth()+1) + ', gebDag = ' + globalDate.getDate() + ' WHERE id = ' + globalID;

		tx.executeSql(sqlStatement, [], function (tx, result)
		{
			indiCancel ();						// Sluit de vensters
			if (qr)								// Er is iemand toegevoegd op basis van een gelezen QR code
			{
				globalID = result.insertId;
				selectPerson (globalID);
				addMedicationList (globalID);	// en voeg nu de lijst toe voor deze nieuwe gebruikert
			}
			else								// Handmatig een nieuwe persoon toegevoegd
			{
				var persons = document.getElementById ('persons');
				fillPersons (persons);			// Dan zitten we nu in de gebruikerlijst, dus opnieuw opbouwen
			}
		}, function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
			indiCancel ();
		}, function ()
		{
			indiCancel ();
		});
	});
}

function indiCancel ()
{
	
	document.getElementById ('individual').style.opacity = '0';
	document.getElementById ('individualCover').style.opacity = '0';
	setVisibility ('load', true);
	setVisibility ('back', true);
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
	
	if (   !isChecked ('iconDeleteAll')
	    && !isChecked ('iconDeleteLists'))
	{
		myAlert ('U hebt niets aangegeven om te verwijderen');
	}
	else if (isChecked ('iconDeleteAll'))
	{
		db.transaction(function(tx)
		{
			tx.executeSql('SELECT * FROM lijsten WHERE patient = ' + id, [], function (tx, results)
			{
				aantal = results.rows.length;
			}), function (tx, error)
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
						}), function (tx, error)
						{
							alert ('er is een fout opgetreden\r\n' + error.message);
						}, function ()
						{
						};
						var persons = document.getElementById ('persons');
					
						fillPersons (persons);
					}
				}
			}), function (tx, error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
//				alert ('namen gelezen en verwerkt');
			};
		});
		deleteCancel ();								// haal het scherm weg
	}
	if (   isChecked ('iconDeleteAll')					// Alleen medicatielijsten weg
		|| isChecked ('iconDeleteLists'))				// Of persoon inclusief de lijsten
	{
		db.transaction(function(tx)
		{
			tx.executeSql('DELETE FROM lijsten WHERE patient = ' + id, [], function (tx, results)
			{
			}), function (tx, error)
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
		}), function (tx, error)
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
				setVisibility ('load', false);
				setVisibility ('back', false);
				document.getElementById ('individualCover').style.opacity = '0.4';
				var individual = document.getElementById ('individualDelete');
				if (individual)
				{
					individual.style.opacity = '1';
				}
				else
					alert ('kan individualDelete niet vinden');
			}
		}), function (tx, error)
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
	setVisibility ('load', true);
	setVisibility ('back', true);
	setTimeout(function()
	{
		setVisibility ('individualDelete', false);
		setVisibility ('individualCover', false);
	}, 500);
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
				}), function (tx, error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};
			}
		}), function (tx, error)
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

//--------------------------------------------------------------------------------------------------------------------------------
// We hebben een QR code gelezen voor een patient met een geboortedatum die we nog niet kennen.
// Die moeten we nu dus toevoegen of we moeten stoppen
//
function nieuwePatient (year, month, day)
{
	var r = -1;
	var question;
	var d = getReadableDate (year, month, day);

	question = 'Er is nog geen gebruiker geregistreerd met geboortedatum\r\n     ' + d + '\r\n'
			 + 'Wilt u deze gebruiker nu aanmaken?';
	var q = confirm (question);						// Wat denk u ervan?
	
	if (q)											// Yep, dus nu even het betreffende scherm opbouwen
	{
		var preset = year + '-';					// de datum wordt vooraf ingevuld als yyyy-mm-dd
		if (month < 10)
			preset += '0';
		preset += month + '-';
		if (day < 10)
			preset += '0';
		preset += day;
		var individual = document.getElementById ('individual');
		setVisibility ('individualCover', true);
		document.getElementById ('individualCover').style.opacity = '0.4';
		setVisibility ('individual', true);
		document.getElementById ('individualText').innerHTML = '<b>Nieuwe gebruiker</b>';
		document.getElementById ('indiNaam').value = '';
		document.getElementById ('indiGeboren').value = preset;
		document.getElementById ('indiGeboren').disabled = true;		// Geboortedatum  mag u niet meer aanpassen!
		document.getElementById ('individualButton').setAttribute ('onmouseup', 'indiOK (-1,1);');
		document.getElementById ('indiNaam').focus();
		setVisibility ('back', false);
		if (individual)
		{
			individual.style.opacity = '1';
		}
	}
}

//------------------------------------------------------------------------------------------------
// Voeg een nieuwe medicatielijst toe
//
function addMedicationList (patient)
{
	var sqlStatement;
	var apotheek;
	var apotheekID = null;
	var datum;
	var date = null;
	var lijst;

	if (receivedList == null)
		return ;
	apotheek = receivedList.pharmacyName;
	apotheekID = receivedList.agbCode;
	if (receivedList.timestamp)
		date = new Date (receivedList.timestamp);
	if (   !apotheekID
		|| !date)
	{
		myAlert ('Geen geldig medApp bestand ontvangen (3)');
		return ;
	}
	var listDag   = date.getDate ();
	var listMaand = date.getMonth ()+1;
	var listJaar  = date.getFullYear ();

	db.transaction (function (tx)
	{
		sqlStatement = 'INSERT INTO lijsten (apotheekID, apotheek, listDag, listMaand, listJaar, patient) VALUES (\''
		             + apotheekID + '\', \'' + apotheek + '\', ' + listDag + ', ' + listMaand + ', ' + listJaar + ', ' + patient + ')';
		tx.executeSql(sqlStatement, [], function (tx, results)
		{
			lijst = results.insertId;
			importOverzicht (patient, lijst);
		}, function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		});
	});
}

//------------------------------------------------------------------------------------------------
// Voeg nu de regels van de nieuwe lijst toe
//
function importOverzicht (id, lijst)
{
	var sqlStatement;
	var medicatie = receivedList.medicationDispenseEvents;
	
	db.transaction (function (tx)
	{
		for (var i = 0; i < medicatie.length; i++)
		{
			var medicijn                = medicatie[i];
			var uuid                    = '';
			var transcriptTimestamp     = '';
			var dispenseTimestamp       = '';
			var voorschrijverNaam       = '';
			var voorschrijverAGB        = '';
			var voorschrijverSpec       = '';
			var startGebruik            = '';
			var eindGebruik             = '';
			var hoeveelheid             = 0;
			var codeUnit                = '';
			var zi                      = '';
			var hpk                     = '';
			var prk                     = '';
			var dispensedMedicationName = '';
			var iterationCredit         = 0 ;
			var iterationDate           = '';
			var text1                   = '';
			var text2                   = '';
			var text3                   = '';
			var text4                   = '';
			var text5                   = '';

			if (medicijn.id)
				uuid = medicijn.id;
			if (medicijn.transcriptionTimestamp)
				transcriptTimestamp = medicijn.transcriptionTimestamp;
			if (medicijn.dispenseTimestamp)
				dispenseTimestamp = medicijn.dispenseTimestamp;
			if (medicijn.prescriber)
			{
				if (medicijn.prescriber.agbCode)
					voorschrijverAGB = medicijn.prescriber.agbCode;
				if (medicijn.prescriber.name)
					voorschrijverNaam = medicijn.prescriber.name;
				if (medicijn.prescriber.speciality)
					voorschrijverSpec = medicijn.prescriber.speciality;
			}
			if (medicijn.usageStartDate)
				startGebruik = medicijn.usageStartDate;
			if (medicijn.usageEndDate)
				eindGebruik = medicijn.usageEndDate;
			if (medicijn.amount)
				hoeveelheid = medicijn.amount;
			if (medicijn.codedUnit)
				codeUnit = medicijn.codedUnit;
			if (medicijn.zi)
				zi = medicijn.zi;
			if (medicijn.hpk)
				zi = medicijn.hpk;
			if (medicijn.prk)
				zi = medicijn.prk;
			if (medicijn.dispensedMedicationName)
				dispensedMedicationName = medicijn.dispensedMedicationName;
			if (medicijn.guidanceText)
			{
				var length = medicijn.guidanceText.length;

				if (length > 0)
					text1 = medicijn.guidanceText[0];
				if (length > 1)
					text2 = medicijn.guidanceText[1];
				if (length > 2)
					text3 = medicijn.guidanceText[2];
				if (length > 3)
					text4 = medicijn.guidanceText[3];
				if (length > 4)
					text5 = medicijn.guidanceText[4];
			}

			sqlStatement = 'INSERT INTO medicatie (lijst, regel, uuid, transcriptTimestamp, dispenseTimestamp,'
						 + 'voorschrijverNaam, voorschrijverAGB, voorschrijverSpec, startGebruik, eindGebruik,'
						 + 'hoeveelheid, codeUnit, zi, hpk, prk, dispensedMedicationName, iterationCredit,'
						 + 'iterationDate, text1, text2, text3, text4, text5) VALUES ('
			             +        lijst                   + ','
						 +        (i+1)                   + ','
						 + '\'' + uuid                    + '\','
						 + '\'' + transcriptTimestamp     + '\','
						 + '\'' + dispenseTimestamp       + '\','
						 + '\'' + voorschrijverNaam       + '\','
						 + '\'' + voorschrijverAGB        + '\','
						 + '\'' + voorschrijverSpec       + '\','
						 + '\'' + startGebruik            + '\','
						 + '\'' + eindGebruik             + '\','
						 +        hoeveelheid             + ','
						 + '\'' + codeUnit                + '\','
						 + '\'' + zi                      + '\','
						 + '\'' + hpk                     + '\','
						 + '\'' + prk                     + '\','
						 + '\'' + dispensedMedicationName + '\','
						 +        iterationCredit         + ','
						 + '\'' + iterationDate           + '\','
						 + '\'' + text1                   + '\','
						 + '\'' + text2                   + '\','
						 + '\'' + text3                   + '\','
						 + '\'' + text4                   + '\','
						 + '\'' + text5                   + '\')';

			tx.executeSql(sqlStatement, [], function (tx, results)
			{
			}, function (tx, error)
			{
				alert ('er is een fout opgetreden bij invoeren van de lijst\r\n' + error.message);
			}, function ()
			{
			});
		}
		selectPerson (id);
		setVisibility ('back', false);	// Er zou een terugknop kunnen staan. Die willen we nu niet meer
		showList (db);
	});
}

function fillLists (lists)
{
	var id;
	var naam;
	var geboren;
	var div;
	var action;
	var colorName;
	
	div = lists.getElementsByClassName ('personLine');
	var i = div.length;
	while (i--)
	{
		lists.removeChild (div[i]);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			var header = document.getElementById ('personsHeader');
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				if (header)
					header.innerHTML = '<b>lijsten van ' + row['naam'] + '</b>';
				showListsStep2 (db, lists, row['id']);
			}
			else
			{
				if (header)
					header.innerHTML = '<b>Er is nog niemand geselecteerd</b>';
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function showListsStep2 (db, lists, id)
{
	var div;
	var colorName;

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM lijsten WHERE patient = ' + id, [], function (tx, results)
		{
			for (var i = 0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				div = document.createElement ('div');
				div.className = 'personLine standard';
				div.setAttribute ('onmouseup', 'showSimpleList (' + row['id'] + ')');
				var day = row['listDag'];
				if(day<10){ day="0"+day;}
				var month = row['listMaand'];
				if(month<10){ month="0"+month;}
				var szHTML = day + '-' + month + '-' + row['listJaar'];
				szHTML += ', ';
				szHTML += row['apotheek'];
				div.innerHTML = szHTML;
				
				lists.appendChild (div);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function showSimpleList (lijst)
{
	var overzicht = document.getElementById ('overzicht');
	var div = overzicht.childNodes;
	var i = div.length;
	var apotheek = '';
	var szHTML = '';
	var persons;
	
	persons = document.getElementById ('persons');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	if (persons)
	{
		persons.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('persons', false);
		}, 500);
	}
	while (i-- > 0)			// verwijder alle regels uit een eventuele huidige lijst, behalve de header
	{
		if (div[i].id != 'itemHeader')
			overzicht.removeChild (div[i]);
	}

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			var header = document.getElementById ('personsHeader');
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				szHTML = '<b>lijsten van ' + row['naam'] + '</b>';
				tx.executeSql('SELECT * FROM lijsten WHERE id = ' + lijst, [], function (tx, results)
				{
					if (results.rows.length == 1)
					{
						row = results.rows.item(0);
						var d = formatDate (row['listDag'], row['listMaand'], row['listJaar']);
						szHTML += '<br><span class="standard">lijst van ' + row['apotheek'] + ', ' + d + '</span>';
						document.getElementById ('itemHeader').innerHTML = szHTML;
						showListStep3 (db, lijst);
					}
					else
						alert ('Kon de lijst (' + lijst + ') niet meer terugvinden');
				}), function (tx, error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

// --------------------------------------------------------------------------------------
// Verwerk een ontvangen JSON medicatieoverzicht.
//
function ProcessReceivedData ()
{
	// --------------------------------------------------------------------------------------
	// Stap 1: Eerst eens zien of we een gebruiker kennen met de opgegeven geboortedatum.
	// Zo niet, dan vragen we of we iemand moeten aanmaken.
	// Als er meer dan één is (tweeling) dan vragen we welke we moeten hebben.
	//
	var dateTemp = globalBirthDate.split ('-');		// haal even uit elkaar
	if (dateTemp.length != 3)						// daaruit moeten we drie componenten overhouden
	{
		myAlert ('Er is iets misgegaan in het interpreteren van de geboortedatum');
		return ;
	}
	g_year  = dateTemp[0];							// Namelijk het geboortejaar,
	g_month = dateTemp[1];							// de maand
	g_day   = dateTemp[2];							// en de dag

	db.transaction(function(tx)
	{
		// ---------------------------------------------------------------------------------------
		// Zoek de gebruiker
		//
		tx.executeSql('SELECT * FROM person WHERE gebDag = ' + g_day + ' AND gebMaand = ' + g_month + ' AND gebJaar = ' + g_year, [], function (tx, results)
		{
			if (results.rows.length == 0)								// Geen patient gevonden
				r = nieuwePatient (g_year, g_month, g_day)				// vraag of we er een moeten aanmaken
				
			else if (results.rows.length == 1)							// Precies één gebruiker gevonden
			{
				row = results.rows.item (0);
				var id = row['id'];										// Die heeft dus deze id
				addMedicationList (id);									// En daarvoor moeten we een lijst gaan toevoegen
			}

			else														// Oeps, meerdere gebruikers met dezelfde geboortedatum (tweeling of zo?)
			{															// Dan moeten we dus vragen wie het gaat worden
				Cover ('__selectImportPatient', false); 				// onderliggende tekst even bedekken
				var elemWrapper = document.createElement ('div');		// wrapper voor alles
				elemWrapper.id = '__selectImportPatient';				// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
				elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;'
				                          + '-khtml-opacity:0;overflow:hidden;border-radius:20px;';
				elemWrapper.style.transition = 'opacity 0.5s ease';
				elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
				var elemDiv = document.createElement ('div');
				elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;'
									  + 'font-family:calibri, helvetica, sans-serif;'
									  + 'font-size:large;text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;';
				elemDiv.innerHTML = '<b>Kies de juiste gebruiker</b>';
				elemWrapper.appendChild (elemDiv);
				
				elemDiv = document.createElement ('div');
				elemDiv.id = '__brAlertText';
				elemDiv.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding:0px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
									  + 'font-size:medium;text-align:left;color:#000000;background-color:#ffffff;';
				var szHTML  = '';

				var div = document.createElement ('div');
				div.className = 'item standard50 standard selDiv';
				div.setAttribute ('onmouseup', 'selectImportPatient(0);');
				div.innerHTML = 'Maak een nieuwe gebruiker';
				var action = document.createElement ('div');
				action.className = 'importUnselected';
				div.setAttribute ('data-selected', 'false');
				div.setAttribute ('data-patient', '-1');
				div.appendChild (action);
				elemDiv.appendChild (div);
				
				div = document.createElement ('div');
				div.className = 'item standard200 standard selDiv';
				div.setAttribute ('onmouseup', 'selectImportPatient(1);');
				div.innerHTML = 'Deze lijst niet importeren';
				div.setAttribute ('data-selected', 'true');
				div.setAttribute ('data-patient', '-2');
				action = document.createElement ('div');
				action.className = 'importSelected';
				div.appendChild (action);
				elemDiv.appendChild (div);

				for (var i = 0; i < results.rows.length; i++)
				{
					row = results.rows.item(i);
					div = document.createElement ('div');
					div.className = 'item standard selDiv';
					div.setAttribute ('data-selected', 'false');
					div.setAttribute ('data-patient', '\'' + row['id'] + '\'');
					div.setAttribute ('onmouseup', 'selectImportPatient(' + (i+2) + ');');
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
					action.className = 'importUnselected';
					div.appendChild (action);
					elemDiv.appendChild (div);
				}
				elemWrapper.appendChild (elemDiv);

				elemDiv = document.createElement ('div');
				elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
									+ 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;';
				elemDiv.onclick = function () { onClickOK ('__selectImportPatient'); };
//				elemDiv.setAttribute('onclick', 'onClickOK(\'__selectImportPatient\');');
//				elemDiv.setAttribute('onmouseup', 'onClickOK(\'__selectImportPatient\');');
				elemDiv.innerHTML = 'OK';
				elemDiv.onmouseover = function ()
				{
					this.style.backgroundColor = '#ffffff';
				};
				elemDiv.onmouseout = function ()
				{
					this.style.backgroundColor = '#efefef';
				};
				elemWrapper.appendChild (elemDiv);
				document.body.appendChild (elemWrapper);
				
				var vWidth  = elemWrapper.offsetWidth;
				var vHeight = elemWrapper.offsetHeight;
				vWidth = parseInt (vWidth/2, 10);
				vHeight = parseInt (vHeight/2, 10);
				elemWrapper.style.marginLeft = '-' + vWidth + 'px';
				elemWrapper.style.marginTop = '-' + vHeight + 'px';
				
				elemWrapper.style.opacity = '1';
				elemWrapper.style.mozOpacity = '1';
				elemWrapper.style.khtmlOpacity = '1';
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function largeFont ()
{
	var largeFont = toggle ('largeFont');

	setFontSizes ();
}

function setFontSizes ()
{
	var vFont = document.getElementById ('largeFont');
	if (!vFont)
		return ;

	var className = vFont.className;
	var largeFont = false;
	if (className == 'checked')
		largeFont = true;
	var div = document.getElementsByClassName ('standard');
	if (!div)
		return;
	var fontSize = 'small';

	if (largeFont)
		fontSize = 'medium';
	for (var i = 0; i < div.length; i++)
		div[i].style.fontSize = fontSize;
	div = document.getElementsByClassName ('large');
	if (!div)
		return;
	fontSize = 'medium';
	if (largeFont)
		fontSize = 'large';
	for (var i = 0; i < div.length; i++)
		div[i].style.fontSize = fontSize;
}
