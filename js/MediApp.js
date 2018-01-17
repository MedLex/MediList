var globalNaam;
var globalDate;
var globalID;
var screenID = 0;
var QRScanner;

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
	screenID = 1;
	
	if (persons)
	{
		setVisibility ('menubutton', false);
		header = document.getElementById ('personsHeader');
		if (header)
			header.innerHTML = '<b>Gebruikers</b>';
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
	
	showMenu (false);
	lists = document.getElementById ('persons');
	
	if (lists)
	{
		setVisibility ('menubutton', false);
		lists.style.display = 'block';
		lists.style.opacity = '1';
		fillLists (lists);
	}
	screenID = 2;
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
	screenID = 3;
}

function configOK ()
{
	var config;
	
	saveSetting ('monthsSave', document.getElementById ('termijn').value);
	saveSetting ('sendPermission', document.getElementById ('askOK').className);

	config = document.getElementById ('config');
	setVisibility ('menubutton', true);
	setVisibility ('load', false);
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
//				if (i%2)
//					colorName = 'standard50';
//				else
//					colorName = 'standard200';
				colorName = 'standardWhite';
				
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
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
//			alert ('namen gelezen en verwerkt');
		};
	});
}

function displayContents(err, text){
	if (err)
	{
		myAlert ('Er is een fout opgetreden bij het scannen');
	}
	else
	{
		// The scan completed, display the contents of the QR code:
		myAlert(text);
	}
}

function plus ()
{
	var individual;
	
	if (screenID == 0)						// medicatielijst
	{
		alert ('we beginnen.....');
		if (!cordova)
			alert ('maar cordova is er niet!!!');
		else if (!cordova.plugins)
			alert ('maar Cordova kent geen plugins');
		else if (!cordova.plugins.barcodeScanner)
			alert ('maar Cordova kent geen barcodeScanner plugin');
		else
			alert ('En we gaan nu scannen');
		
		cordova.plugins.barcodeScanner.scan(
			function (result)
			{
				myAlert("We got a barcode<br />" +
						"Result: " + result.text + "<br />" +
						"Format: " + result.format + "<br />" +
						"Cancelled: " + result.cancelled);
			},
			function (error)
			{
				alert("Scanning failed: " + error);
			},
			{
				preferFrontCamera : true,		// iOS and Android
				showFlipCameraButton : true,	// iOS and Android
				showTorchButton : true,			// iOS and Android
				torchOn: false,					// Android, launch with the torch switched off
				saveHistory: true,				// Android, save scan history (default false)
				prompt : "Place a barcode inside the scan area", // Android
				resultDisplayDuration: 500,		// Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
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
		setVisibility ('individual', true);
		document.getElementById ('individualText').innerHTML = 'Nieuwe gebruiker';
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
		}, function (tx, error)
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
				var individual = document.getElementById ('individualDelete');
				document.getElementById ('individualCover').style.opacity = '0.4';
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

//------------------------------------------------------------------------------------------------
// We importeren nu het aangeboden XML bestand
//
function importXML(data)
{
	if (data == undefined)
		return ;
	
	xmlDoc = loadXMLDoc (data);					// Lees het opgegeven document in
	
	if (!xmlDoc)										// Dat ging dus niet
		myAlert ('Het bestand \'' + data + '\' is geen MediApp bestand en kan niet worden geladen');
	else
		checkPatient (xmlDoc,						// Zoek eerst de patient op
					  checkOverzicht,				// voer daarna de routine "checkOverzicht" uit.
					  addList,						// dan de routine "addList"
					  importOverzicht);				// en tenslotte "importOverzicht"
}

//------------------------------------------------------------------------------------------------
// Kijk of we deze patient al kennen of dat er een nieuwe moet worden aangemaakt (of helemaal niet)
// return 1 als we deze patienbt kennen of als er een nieuwe is aangemaakt waar we mee vderder mogen
// return 0 als  we de patient niet kennen en er wordt geen nieuwe aangemaakt.
//
function checkPatient (xml, callback1, callback2, callback3)
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
			myAlert ('Geen geldig medApp bestand ontvangen (2)');
	}
	else
		myAlert ('Geen geldig medApp bestand ontvangen (1)');
	if (geboren)
	{
		var datum = geboren[0].childNodes[0].textContent;
		var date = new Date (datum);
		gebDag   = date.getDate  ();
		gebMaand = date.getMonth ();
		gebJaar  = date.getFullYear  ();
		
		db.transaction(function(tx)
		{
			tx.executeSql('SELECT * FROM person WHERE gebDag = ' + gebDag + ' AND gebMaand = ' + gebMaand + ' AND gebJaar = ' + gebJaar, [], function (tx, results)
			{
				if (results.rows.length == 0)								// Geen patient gevonden
					r = nieuwePatient (xml, patient[0], gebDag, gebMaand, gebJaar, callback1, callback2, callback3)	// vraag of we er een moeten aanmaken
					
				else if (results.rows.length == 1)							// Precies één gebruiker gevonden
				{
					row = results.rows.item (0);
					r = row['id'];											// Die heeft dus deze id
					callback1 (xml, r, callback2, callback3);				// en daar kunnen we mee verder
				}

				else														// Oeps, meerdere gebruikers met dezelfde geboortedatum (tweeling of zo?)
				{															// Dan moeten we dus vragen wie het gaat worden
					Cover ();    											// onderliggende tekst even bedekken
					var elemWrapper = document.createElement ('div');		// wrapper voor alles
					elemWrapper.id = '__selectImportPatient';				// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
					elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overflow:hidden;box-shadow: 12px 12px 8px grey;';
					elemWrapper.style.transition = 'opacity 0.5s ease';
					elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
					var elemDiv = document.createElement ('div');
					elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
										  + 'font-size:large;text-align:left;color:#000000;background-color:#FF9800;padding-left:15px;';
					elemDiv.innerHTML = 'Kies de juiste gebruiker';
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
//						if (i%2)
	//						div.className = 'item standard200 standard selDiv';
		//				else
			//				div.className = 'item standard50 standard selDiv';
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
					elemDiv.setAttribute('onclick', 'onClickOK(\'__selectImportPatient\');');
					elemDiv.setAttribute('onmouseup', 'onClickOK(\'__selectImportPatient\');');
					elemDiv.innerHTML = 'OK';
					elemDiv.onmouseover = function ()
					{
						this.style.backgroundColor = '#afafaf';
					};
					elemDiv.onmouseout = function ()
					{
						this.style.backgroundColor = '#ffffff';
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
}

function onClickImportOK (szName)
{
	
    var elemCover = document.getElementById ('__brCover');
    var elemWrapper = document.getElementById (szName);
	
	var selected = getSelectedImport ();
	if (elemWrapper)
	{
		elemWrapper.style.opacity = '0';
		elemWrapper.style.mozOpacity = '0';
		if (elemCover)
		{
			elemCover.style.opacity = '0';
			elemCover.style.mozOpacity = '0';
		}
		__divName = szName;
		setTimeout(function()
		{
			var divCover = document.getElementById ('__brCover');
			var divWrapper = document.getElementById (__divName);
			
			if (divWrapper)
				divWrapper.parentNode.removeChild (divWrapper);
			if (divCover)
				divCover.parentNode.removeChild (divCover);
		}, 500);
	}
	if (selected == -2)				// Deze lijst niet importeren. We stoppen dus
		return ;
	else if (selected == -1)		// Nieuwe patient aanmaken
	{
		var patient  = xmlDoc.getElementsByTagName ('Patient');
		var geboren  = null;
		
		if (patient)
		{
			geboren = patient[0].getElementsByTagName ('Geboortedatum');
			if (!geboren)
				myAlert ('Geen geldig medApp bestand ontvangen (2)');
		}
		else
			myAlert ('Geen geldig medApp bestand ontvangen (1)');
		if (geboren)
		{
			var datum = geboren[0].childNodes[0].textContent;
			var date = new Date (datum);
			gebDag   = date.getDate  ();
			gebMaand = date.getMonth ();
			gebJaar  = date.getFullYear  ();
			nieuwePatient (xmlDoc, patient[0], gebDag, gebMaand, gebJaar, checkOverzicht,				// voer daarna de routine "checkOverzicht" uit.
																		  addList,						// dan de routine "addList"
																		  importOverzicht);				// en tenslotte "importOverzicht"
		}
	}
	else									// Bestaande patient gebruiken
	{
		checkOverzicht (xmlDoc, selected, addList, importOverzicht);
	}
}

function selectImportPatient (row)
{
	var selDiv = document.getElementsByClassName ('selDiv');
	var action;
	var icon;
	
	if (row < selDiv.length)
	{
		for (var i = 0; i < selDiv.length; i++)
		{
			if (i == row)
			{
				icon = 'importSelected';
				selDiv[i].setAttribute ('data-selected', 'false');
			}
			else
			{
				icon = 'importUnselected';
				selDiv[i].setAttribute ('data-selected', 'true');
			}
			action = selDiv[i].getElementsByTagName ('div');
			for (var j = 0; j < action.length; j++)
				action[j].className = icon;
		}
	}
}

function getSelectedImport()
{
	var r = -1;
	var selDiv = document.getElementsByClassName ('selDiv');
	for (var i = 0; i < selDiv.length; i++)
	{
		var selected = selDiv[i].getAttribute ('data-selected');
		if (selected == 'true')
		{
			var patient = selDiv[i].getAttribute ('data-patient');
			r = parseInt (patient);
		}
	}
	
	return r;
}

//--------------------------------------------------------------------------------------------------------------------------------
// We hebben een xml ontvangen voor een patient met een geboortedatum die we nog niet kennen.
// Die moeten we nu dus toevoegen of we moeten stoppen
//
function nieuwePatient (xml, patient, gebDag, gebMaand, gebJaar, callback1, callback2, callback3)
{
	var r = -1;
	var geboren = patient.getElementsByTagName ('Geboortedatum');
	var naam = patient.getElementsByTagName ('Naam');
	var question;
	
	question = 'Er is nog geen gebruiker geregistreerd met de volgende gegevens:\r\n-----------------\r\nnaam = \'' + naam[0].childNodes[0].textContent
	           + '\r\ngeboortedatum ' + geboren[0].childNodes[0].textContent + '\r\n-----------------\r\n'
			   + 'Wilt u deze gebruiker nu aanmaken?';
	var q = confirm (question);						// Wat denk u ervan?

	if (q)											// Toevoegen dus
	{
		var sqlStatement = 'INSERT INTO person (naam, gebJaar, gebMaand, gebDag) VALUES (\'' + naam[0].childNodes[0].textContent + '\', ' + gebJaar + ', ' + gebMaand + ', ' + gebDag + ')';
		db.transaction(function(tx)
		{
			tx.executeSql(sqlStatement, [], function (tx, results)	// Voeg nieuwe patient toe
			{
				r = results.insertId;								// Dit is de id geworden
				callback1 (xml, r, callback2, callback3);			// en daarmee kunnen we nu verder
			}, function (tx, error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
			});
		});
	}
}

//------------------------------------------------------------------------------------------------
// Kijk of we dit overzicht al kennen
//
function checkOverzicht (xml, id, callback2, callback3)
{
	var r        = 1;
	var algemeen  = xml.getElementsByTagName ('Algemeen');
	var apotheek;
	var apotheekID = null;
	var datum;
	var date = null;
	var sqlStatement;
	
	if (algemeen)
	{
		apotheek = algemeen[0].getElementsByTagName ('Apotheek');
		if (apotheek)
			apotheekID = apotheek[0].getAttribute ('ID');
		datum = algemeen[0].getElementsByTagName ('DatumOverzicht');
		if (datum)
			date = new Date (datum[0].childNodes[0].textContent);
	}
	if (   !apotheekID
		|| !date)
		myAlert ('Geen geldig medApp bestand ontvangen (3)');
	else
	{
		db.transaction(function(tx)
		{
			sqlStatement = 'SELECT id FROM lijsten WHERE '
			              + 'apotheekID = \'' + apotheekID + '\' AND '
						  + 'listDag = ' + date.getDate () + ' AND '
						  + 'listMaand = ' + date.getMonth () + ' AND '
						  + 'listJaar = ' + date.getFullYear () + ' AND '
						  + 'patient = ' + id;
			tx.executeSql(sqlStatement, [], function (tx, results)
			{
				var bDoen = true;
				if (results.rows.length > 0)
				{
					var question = 'Er is al een lijst bekend voor deze gebruiker op deze datum\r\n';
					question += 'wilt u deze lijst toch toevoegen?';
					bDoen = confirm (question);
				}
				if (bDoen)
					callback2 (xml, id, callback3);
			}, function (tx, error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
			});
		});
			
	}
	return r;
}

//------------------------------------------------------------------------------------------------
// Voeg een nieuwe medicatielijst toe
//
function addList (xml, id, callback3)
{
	var sqlStatement;
	var algemeen  = xml.getElementsByTagName ('Algemeen');
	var apotheek;
	var apotheekID = null;
	var datum;
	var date = null;
	var lijst;
	
	if (algemeen)
	{
		apotheek = algemeen[0].getElementsByTagName ('Apotheek');
		if (apotheek)
			apotheekID = apotheek[0].getAttribute ('ID');
		datum = algemeen[0].getElementsByTagName ('DatumOverzicht');
		if (datum)
			date = new Date (datum[0].childNodes[0].textContent);
	}
	if (   !apotheekID
		|| !date)
	{
		myAlert ('Geen geldig medApp bestand ontvangen (3)');
		return ;
	}

	db.transaction (function (tx)
	{
		sqlStatement = 'INSERT INTO lijsten (apotheekID, apotheek, listDag, listMaand, listJaar, patient) VALUES (\''
		             + apotheekID + '\', \'' + apotheek[0].childNodes[0].textContent + '\', ' + date.getDate() + ', ' + date.getMonth() + ', ' + date.getFullYear() + ', ' + id + ')';
		tx.executeSql(sqlStatement, [], function (tx, results)
		{
			lijst = results.insertId;
			callback3 (xml, id, lijst);
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
function importOverzicht (xml, id, lijst)
{
	var sqlStatement;
	var medicatie = xml.getElementsByTagName ('Medicatie');
	
	db.transaction (function (tx)
	{
		for (var i = 0; i < medicatie.length; i++)
		{
			var medicijn = getXmlValue (medicatie[i], 'NaamMedicijn');
			var datum = '';
			var voorschrijver = '';
			var dosering = '';
			var startDate = '';
			var stopDate = '';
			var duur = '';
			var toediening = '';
			var toelichting = '';
			var herhaling = medicatie[i].getElementsByTagName ('Herhaling');
			var magHerhaald = 0;
			var magHerhaaldText;
			var herhaalCode = '';
			var voorschrift = medicatie[i].getElementsByTagName ('Voorschrift');
			var waarschuwing = getXmlValue (medicatie[i], 'Waarschuwing');
			if (voorschrift && voorschrift.length > 0)
			{
				datum = getXmlValue (voorschrift[0], 'DatumVoorschrijven');
				voorschrijver = getXmlValue (voorschrift[0], 'Voorschrijver');
			}
			if (herhaling && herhaling.length > 0)
			{
				magHerhaaldText = getXmlValue (herhaling[0], 'MagHerhaald');
				if (magHerhaaldText == 'true')
					magHerhaald = 1;
				herhaalCode = getXmlValue (herhaling[0], 'HerhaalCode');
			}
			dosering = getXmlValue (medicatie[i], 'Dosering');
			startDate = getXmlValue (medicatie[i], 'StartDatum');
			stopDate = getXmlValue (medicatie[i], 'StopDatum');
			toediening = getXmlValue (medicatie[i], 'ToedieningsWijze');
			toelichting = getXmlValue (medicatie[i], 'Toelichting');
			sqlStatement = 'INSERT INTO medicatie (lijst, regel, datum, voorschrijver, medicijn, dosering, start, end, duur, toediening, toelichting, herhaling, code, waarschuwing) VALUES ('
			             + lijst + ', ' + (i+1) + ', \''
						 + datum + '\', \''
						 + voorschrijver + '\', \''
						 + medicijn + '\', \''
						 + dosering + '\', \''
						 + startDate + '\', \''
						 + stopDate + '\', 0, \''
						 + toediening + '\', \''
						 + toelichting + '\', '
						 + magHerhaald + ', \''
						 + herhaalCode + '\', \''
						 + waarschuwing + '\')';

			tx.executeSql(sqlStatement, [], function (tx, results)
			{
//				alert ('regel toegevoegd met id ' + results.insertId);
			}, function (tx, error)
			{
				alert ('er is een fout opgetreden bij invoeren van de lijst\r\n' + error.message);
			}, function ()
			{
			});
		}
		selectPerson (id);
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
				if (i%2)
					colorName = 'standard50';
				else
					colorName = 'standard200';
				
				div.className = 'personLine large ' + colorName;
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
