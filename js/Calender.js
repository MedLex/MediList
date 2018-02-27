//-----------------------------------------------------------------------------
// Calender.js
// de functies voor het tonen en onderhouden van de medicatiekalender
//

var calender;
var tijd;

function showCalender ()
{

	showMenu (false);
	calender = document.getElementById ('list');
	screenID = 4;

	if (calender)
	{
		setVisibility ('menubutton', false);
		setVisibility ('back', true);
		calender.style.display = 'block';
		calender.style.opacity = '1';
		fillCalender ();
	}
}

function calenderOK ()
{
	calender = document.getElementById ('list');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	screenID = 0;							// weer het medicatielijst scherm
	setVisibility ('load', true);
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
	
	div = calender.getElementsByClassName ('listLine');
	var i = div.length;
	while (i--)
	{
		calender.removeChild (div[i]);
	}
	globalID = -1;
	setVisibility ('load', false);
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
				setVisibility ('load', true);
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
		tx.executeSql('SELECT * FROM tijden WHERE personID = '+ personID, [], function (tx, results)
		{
			var fontSize = 'small';

			if (document.getElementById ('largeFont').className == 'checked')
				fontSize = 'medium';

			for (var i = 0; i < results.rows.length; i++)
			{
				var row = results.rows.item(i);
				var div = document.createElement ('div');
				div.className = 'listLine tijdLine standardWhite';
				div.style.fontSize = fontSize;
				div.style.fontFamily = 'calibri';
				div.setAttribute ('data-tijd', row['tijdID']);
				div.setAttribute('onmouseup', 'editTijd(' + row['tijdID'] + ');');

				var periodiciteit = parseInt (row['periodiciteit']);
				var szHTML = 'iedere ';
				if (periodiciteit == 0)
					szHTML += 'dag';
				else if (periodiciteit == 1)
					szHTML += 'week';
				else
					szHTML += 'andere dag';
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
	document.getElementById ('iedereDag').checked = true;
	openTijdstip ();
}

function openTijdstip ()
{
	var fontSize = 'small';

	if (document.getElementById ('largeFont').className == 'checked')
		fontSize = 'medium';

	setVisibility ('individualCover', true);
	setVisibility ('tijdStip', true);
	setVisibility ('load', false);
	setVisibility ('back', false);
	document.getElementById ('stipText').innerHTML = '<b>Nieuw tijdstip</b>';
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
}

function stipOK ()
{
	var periodiciteit = '0';
	var stipNaam;
	var stipTijd;

	stipNaam = document.getElementById ('stipNaam').value;
	stipTijd = document.getElementById ('stipTijd').value;
	if (stipNaam == '')
		myAlert (  'U hebt nog geen naam ingevuld voor dit tijdstip.<br />'
				 + 'Denk bijvoorbeeld aan namen als \'ontbijt\', \'voor het slapen\' en dergelijke');
	else if (stipTijd == '')
		myAlert ('U hebt nog geen tijd ingevuld voor dit tijdstip.<br />'
				 + 'Tijden worden ingevuld als bijvoorbeeld 8:00, 13:30 en dergelijke');
	else
	{
		var iedere = document.getElementsByName ('iedere');
		for (var i = 0; i < iedere.length; i++)
		{
			if (iedere[i].checked)
				periodiciteit = '' + i;
		}
		db.transaction(function(tx)
		{
			var sqlStatement;

			sqlStatement = 'INSERT INTO tijden (personID, tijdNaam, periodiciteit, tijdStip) VALUES (' + globalID + ', \'' + stipNaam + '\', \'' + periodiciteit + '\', \'' + stipTijd + '\')';

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
	setVisibility ('load', true);
	setVisibility ('back', true);
	setTimeout(function()
	{
		setVisibility ('tijdStip', false);
		setVisibility ('individualCover', false);
	}, 500);
}
