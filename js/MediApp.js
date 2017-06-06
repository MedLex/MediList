var globalNaam;
var globalDate;
var globalID;

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
	setVisibility ('menubutton', false);
	
	if (persons)
	{
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
	setVisibility ('menubutton', true);
	if (persons)
	{
		persons.style.opacity = '0';
		showList (db);
		setVisibility ('load', false);
		setTimeout(function()
		{
			setVisibility ('persons', false);
		}, 500);
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
	}
}

function configOK ()
{
	var config;
	
	saveSetting ('monthsSave', document.getElementById ('termijn').value);
	saveSetting ('sendPermission', document.getElementById ('askOK').className);

	config = document.getElementById ('config');
	setVisibility ('menubutton', true);
	if (config)
	{
		config.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('config', false);
		}, 500);
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
					setVisibility ('load', false);
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
	setVisibility ('load', true);
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
		deleteCancel ();								// haal het scherm weg
	}
	if (   isChecked ('iconDeleteAll')					// Alleen medicatielijsten weg
		|| isChecked ('iconDeleteLists'))				// Of persoon inclusief de lijsten
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
				setVisibility ('load', false);
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
	setVisibility ('load', true);
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

//------------------------------------------------------------------------------------------------
// We importeren nu het aangeboden XML bestand
//
function importXML(data)
{
	var bContinue = 0;					// Zolang we verder kunnen (of mogen)
	var id = -1;
	var xml = loadXMLDoc (data);
	if (!xml)
		myAlert ('Het bestand \'' + data + '\' is geen MediApp bestand en kan niet worden geladen');
	else
	{
		id =  checkPatient (xml);		// Zoek eerst de patient op
		if (id >= 0)					// Hebben we een patient gevonden of ingevoerd?
			bContinue = 1;				// dan kunnen we nu verder
	}
}

//------------------------------------------------------------------------------------------------
// Kijk of we deze patient al kennen of dat er een nieuwe moet worden aangemaakt (of helemaal niet)
// return 1 als we deze patienbt kennen of als er een nieuwe is aangemaakt waar we mee vderder mogen
// return 0 als  we de patient niet kennen en er wordt geen nieuwe aangemaakt.
//
function checkPatient (xml)
{
	var r        = -1;
	var gebDag   = 0;
	var gebMaand = 0;
	var gebJaar  = 0;
	var geboren  = null;
	var patient  = xml.getElementsByTagName ('Patient');
	
	if (patient)
	{
		geboren = patient[0].getElementsByTagName ('Geboortedatum');
		if (!geboren)
			alert ('kan tag \'geboren\' niet meer vinden!');
	}
	else
		alert ('Kan tag \'Patient\' niet meer vinden');
	if (geboren)
	{
		var datum = geboren[0].childNodes[0].textContent;
		var date = new Date (datum);
		gebDag   = date.getDate  ();
		gebMaand = date.getMonth ()+1;
		gebJaar  = date.getFullYear  ();
		
		alert ('we gaan nu zoeken naar iemand met als geboortedatum \'' + geboren[0].childNodes[0].textContent + '\'');

		db.transaction(function(tx)
		{
			tx.executeSql('SELECT id, FROM person WHERE gebDag = ' + gebDag + ' AND gebMaand = ' + gebMaand + ' AND gebJaar = ' + gebJaar, [], function (tx, results)
			{
				if (results.rows.length == 0)
					nieuwePatient (patient[0])
				else if (results.rows.length == 1)
				{
					row = results.rows.item (0);
					r = row['id'];
				}
				else
				{
					for (var i = 0; i < results.rows.length; i++)
					{
						row = results.rows.item(i);
					}
				}
			}), function (error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
			};
		});
	}
	
	return r;
}

function nieuwePatient (patient)
{
	var r = -1;
	var geboren = patient.getElementsByTagName ('Geboortedatum');
	var naam = patient.getElementsByTagName ('Naam');
	var question;
	
	question = 'Er is nog geen gebruiker geregistreerd met\r\nnaam = \'' + naam[0].childNodes[0].textContent
	           + '\r\nen geboortedatum ' + geboren[0].childNodes[0].textContent + '\r\n'
			   + 'Wilt u deze gebruiker nu aanmaken?';
	var q = confirm (question);
	
	return r;
}
