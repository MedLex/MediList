//-----------------------------------------------------------------------------
// Calender.js
// de functies voor het tonen en onderhouden van de medicatiekalender
//

var calender;
var tijd;

function calenderOK ()
{
	calender = document.getElementById ('kalender');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	screenID = 0;							// weer het medicatielijst scherm
	setVisibility ('plus', true);
	if (calender)
	{
		calender.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('list', false);
		}, 500);
	}
}

function fillCalender ()
{
	var div;
	var action;
	var colorName;
	
	calender = document.getElementById ('kalender');
	div = calender.getElementsByClassName ('listLine');
	var i = div.length;
	while (i--)
	{
		calender.removeChild (div[i]);
	}
	globalID = -1;
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				document.getElementById ('listHeader').innerHTML = '<b>Medicijn kalender van ' + row['naam'] + '</b>';
				currentUser = row['naam'];
				globalID = row['id'];
				fillCalenderStep2 (row['id']);
				setVisibility ('plus', true);
			}
			else
				document.getElementById ('listHeader').innerHTML = '<b>Medicijn kalender</b>';
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function fillCalenderStep2 (personID)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM tijden WHERE personID = '+ personID + ' ORDER BY tijdStip', [], function (tx, results)
		{
			var fontSize = 'small';

			if (isLargeFont ())
				fontSize = 'medium';

			for (var i = 0; i < results.rows.length; i++)
			{
				var row = results.rows.item(i);
				var div = document.createElement ('div');
				div.className = 'listLine tijdLine standardWhite';
				div.style.fontSize = fontSize;
				div.style.fontFamily = 'calibri';
				div.setAttribute ('data-tijd', row['tijdID']);
				div.setAttribute('onmouseup', 'editTijd(' + row['personID'] + ', ' + row['tijdID'] + ');');

				var periodiciteit = row['periodiciteit'];
				var szHTML = '';
				if (periodiciteit == '1111111')
					szHTML = 'Iedere dag';
				else
				{
					for (var j=0; j < periodiciteit.length; j++)
					{
						if (periodiciteit.charAt (j) == '1')
						{
							if (szHTML != '')
								szHTML += ', ';
							switch (j)
							{
							case 0:
								szHTML = "Ma";
								break;
							case 1:
								szHTML += "Di";
								break;
							case 2:
								szHTML += "Woe";
								break;
							case 3:
								szHTML += "Do";
								break;
							case 4:
								szHTML += "Vrij";
								break;
							case 5:
								szHTML += "Zat";
								break;
							case 6:
								szHTML += "Zon";
								break;
							}
						}
					}
				}
				szHTML += '<br /><b>';
				szHTML += row['tijdStip'];
				szHTML += ', ';
				szHTML += row['tijdNaam'];
				szHTML += '</b>';
				div.innerHTML = szHTML;

				//----------------------------------------------------------------------------------------
				// todo: hier allerlei info gaan toevoegen
				//

				calender.appendChild (div);
			}
			fillCalenderStep3 (personID);
			setFontSizes ();
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function editTijd (personID, rowID)
{
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM tijden WHERE personID = '+ personID + ' AND tijdID = ' + rowID, [], function (tx, results)
		{
			var fontSize = 'small';

			if (isLargeFont ())
				fontSize = 'medium';
			if (results.length < 1)
				myAlert ('Oeps, deze tijd kan niet meer worden teruggevonden in de database');
			else
			{
				var szHTML = '';
				var row = results.rows.item (0);
				setVisibility ('stipDelete', true);
				document.getElementById ('stipNaam').value = row['tijdNaam'];
				document.getElementById ('stipTijd').value = row['tijdStip'];
				var periodiciteit = row['periodiciteit'];
				var iedere = document.getElementsByName ('iedere');
				for (var j=0; j < iedere.length; j++)
					iedere[j].checked = false;
				for (var j=0; j < periodiciteit.length; j++)
				{
					if (periodiciteit.charAt (j) == '1')
					{
						if (szHTML != '')
							szHTML += ', ';
						switch (j)
						{
						case 0:
							document.getElementById ('maandag').checked = true;
							break;
						case 1:
							document.getElementById ('dinsdag').checked = true;
							break;
						case 2:
							document.getElementById ('woensdag').checked = true;
							break;
						case 3:
							document.getElementById ('donderdag').checked = true;
							break;
						case 4:
							document.getElementById ('vrijdag').checked = true;
							break;
						case 5:
							document.getElementById ('zaterdag').checked = true;
							break;
						case 6:
							document.getElementById ('zondag').checked = true;
							break;
						}
					}
				}
				var stip = document.getElementById ('tijdStip');
				stip.setAttribute ('data-person', '' + row['personID']);
				stip.setAttribute ('data-stip', '' + row['tijdID']);
				openTijdstip (false);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function fillCalenderStep3 (personID)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM inname WHERE personID = '+ personID, [], function (tx, results)
		{
			for (var i = 0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				var tijden = calender.getElementsByClassName ('tijdLine');
				for (var i = 0; i < tijden.length; i++)
				{
					tijd = tijden[i].getAttribute ('data-tijd');
					if (tijd == row['tijdID'])
					{
						tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + lijst + ' AND prk = ' + row['prk'], [], function (tx, results)
						{
							if (results.length > 0)
							{
								var szHTML = tijd.innerHTML;
								szHTML += '<br />&nbsp;&nbsp;';
								szHTML += results.rows.item(0)['dispensedMedicationName'];
								tijd.innerHTML = szHTML;
							}
						}), function (tx, error)
						{
							alert ('er is een fout opgetreden\r\n' + error.message);
						}, function ()
						{
						};
					}
				}
			}
			setFontSizes ();
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function nieuwTijdstip ()
{
	var iedere = document.getElementsByName ('iedere');
	for (var i = 0; i < iedere.length; i++)
		iedere[i].checked = true;
	var stip = document.getElementById ('tijdStip');
	stip.setAttribute ('data-person', '');
	stip.setAttribute ('data-stip', '');
	document.getElementById ('stipNaam').value = '';
	document.getElementById ('stipTijd').value = '';
	setVisibility ('stipDelete', false);
	openTijdstip (true);
}

function deleteStip ()
{
	var dataPerson = '';
	var dataStip = '';
	var stipNaam = '';
	var stip = document.getElementById ('tijdStip');
	var bDelete = false;
	dataPerson = stip.getAttribute ('data-person');
	dataStip   = stip.getAttribute ('data-stip');
	stipNaam = document.getElementById ('stipNaam').value;

	if (   dataPerson == ''
		|| dataStip == '')
	{
		myAlert ('oeps... dit tijdstip kan niet worden verwijderd');
		return ;
	}
	else
		bDelete = confirm ('Weet u zeker dat u tijdstip "' + stipNaam + '" wilt verwijderen?');
	if (bDelete)
	{
		db.transaction(function(tx)
		{
			var dataPerson = '';
			var dataStip = '';
			var stip = document.getElementById ('tijdStip');
			dataPerson = stip.getAttribute ('data-person');
			dataStip   = stip.getAttribute ('data-stip');
			tx.executeSql('DELETE FROM tijden WHERE personID = ' + dataPerson + ' AND tijdID = ' + dataStip, [], function (tx, results)
			{
				var dataPerson = '';
				var dataStip = '';
				var stip = document.getElementById ('tijdStip');
				dataPerson = stip.getAttribute ('data-person');
				dataStip   = stip.getAttribute ('data-stip');
				tx.executeSql('DELETE FROM inname WHERE personID = ' + dataPerson + ' AND tijdID = ' + dataStip, [], function (tx, results)
				{
					stipCancel ();
					fillCalender ();
				}), function (tx, error)
				{
					alert ('er is een fout opgetreden\r\n' + error.message);
				}, function ()
				{
				};
			}), function (tx, error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
			}, function ()
			{
			};
		});
	}
}

function openTijdstip (bNieuw)
{
	var fontSize = 'small';

	if (isLargeFont ())
		fontSize = 'medium';

	setVisibility ('individualCover', true);
	setVisibility ('tijdStip', true);
	setVisibility ('plus', false);
	setVisibility ('back', false);
	if (bNieuw)
		document.getElementById ('stipText').innerHTML = '<b>Nieuw tijdstip</b>';
	else
		document.getElementById ('stipText').innerHTML = '<b>Wijzig tijdstip</b>';
	document.getElementById ('individualCover').style.opacity = '0.4';
	var stip = document.getElementById ('tijdStip');
	var td = stip.getElementsByTagName ('td');
	for (var i = 0; i < td.length; i++)
	{
		td[i].style.fontFamily = 'calibri';
		td[i].style.fontSize = fontSize;
	}
	var input = stip.getElementsByTagName ('input');
	for (var i = 0; i < input.length; i++)
	{
		input[i].style.fontFamily = 'calibri';
		input[i].style.fontSize = fontSize;
	}
	var label = stip.getElementsByTagName ('label');
	for (var i = 0; i < label.length; i++)
	{
		label[i].style.fontFamily = 'calibri';
		label[i].style.fontSize = fontSize;
	}
	if (stip)
	{
		stip.style.opacity = '1';
	}
	else
		alert ('kan tijdStip niet vinden');
	document.getElementById ('stipNaam').focus ();

	var vHeight = screen.height;
	vHeight = parseInt (vHeight*0.65);
	document.getElementById ('tijdStip').style.height = vHeight + 'px';
	
	addEnterListener (stipEnter);
	addBackListener (stipBack);
}

function stipEnter (e)
{
	var key = e.which;
	if (key === 13)							// The enter key
	{
		stipOK ();

		e.cancelBubble = true;
		e.returnValue = false;
		return false;
	}
}

function stipBack (e)
{
	e.preventDefault ();
	stipCancel ();
	
	return false;
}

function isDayChecked (dayName)
{
	var r = false;
	
	if (document.getElementById (dayName).checked)
		r = true;
	
	return r;
}

function stipOK ()
{
	var periodiciteit = '';
	var stipNaam;
	var stipTijd;
	var ooit = false;

	stipNaam = document.getElementById ('stipNaam').value;
	stipTijd = document.getElementById ('stipTijd').value;

	if (isDayChecked ('maandag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';
	if (isDayChecked ('dinsdag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';
	if (isDayChecked ('woensdag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';
	if (isDayChecked ('donderdag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';
	if (isDayChecked ('vrijdag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';
	if (isDayChecked ('zaterdag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';
	if (isDayChecked ('zondag'))
	{
		ooit = true;
		periodiciteit += '1';
	}
	else
		periodiciteit += '0';

	if (stipNaam == '')
		myAlert (  'U hebt nog geen naam ingevuld voor dit tijdstip.<br />'
				 + 'Denk bijvoorbeeld aan namen als \'ontbijt\', \'voor het slapen\' en dergelijke');
	else if (stipTijd == '')
		myAlert ('U hebt nog geen tijd ingevuld voor dit tijdstip.<br />'
				 + 'Tijden worden ingevuld als bijvoorbeeld 8:00, 13:30 en dergelijke');
	else if (!ooit)
		myAlert (  'Er zijn geen dagen aangekruist waarop dit tijdstip van toepassing is<br />'
				 + 'U moet tenminste één dag selecteren');
	else
	{
		db.transaction(function(tx)
		{
			var sqlStatement;
			var tijdstip = document.getElementById ('tijdStip');
			var personID = '';
			var tijdID = '';
			
			if (tijdstip)
			{
				personID = tijdstip.getAttribute ('data-person');
				tijdID   = tijdstip.getAttribute ('data-stip');
			}

			if (tijdID == '')
				sqlStatement = 'INSERT INTO tijden (personID, tijdNaam, periodiciteit, tijdStip) VALUES (' + globalID + ', \'' + stipNaam + '\', \'' + periodiciteit + '\', \'' + stipTijd + '\')';
			else
				sqlStatement =	  'UPDATE tijden SET tijdNaam=\'' + stipNaam + '\''
								+ ', periodiciteit=\'' + periodiciteit + '\''
								+ ', tijdStip=\'' + stipTijd + '\''
								+ ' WHERE personID=' + parseInt (personID)
								+ ' AND tijdID=' + parseInt (tijdID);

			tx.executeSql(sqlStatement, [], function (tx, result)
			{
				stipCancel ();
				fillCalender ();
			}, function (tx, error)
			{
				alert ('er is een fout opgetreden\r\n' + error.message);
				stipCancel ();
			}, function ()
			{
				stipCancel ();
			});
		});
	}
}

function stipCancel ()
{
	var individual;

	document.getElementById ('tijdStip').style.opacity = '0';
	document.getElementById ('individualCover').style.opacity = '0';
	setVisibility ('plus', true);
	removeEnterListener ();
	removeBackListener ();
	setTimeout(function()
	{
		setVisibility ('tijdStip', false);
		setVisibility ('individualCover', false);
	}, 500);
}
