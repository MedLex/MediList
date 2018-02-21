//-----------------------------------------------------------------------------
// MediCalender.js
// de fncties voor het tonen en onderhouden van de medicatiekalender
//

var calender;
var tijd;

function showCalender ()
{

	showMenu (false);
	calender = document.getElementById ('persons');
	screenID = 1;

	if (calender)
	{
		setVisibility ('menubutton', false);
		setVisibility ('back', true);
		calender.style.display = 'block';
		calender.style.opacity = '1';
		setVisibility ('load', true);
		screenID = 4;
		fillCalender ();
	}
}

function calenderOK ()
{
	calender = document.getElementById ('persons');
	setVisibility ('menubutton', true);
	setVisibility ('back', false);
	screenID = 0;							// weer het medicatielijst scherm
	setVisibility ('load', true);
	if (calender)
	{
		calender.style.opacity = '0';
		setTimeout(function()
		{
			setVisibility ('persons', false);
		}, 500);
	}
}

function fillCalender ()
{
	var div;
	var action;
	var colorName;
	
	div = calender.getElementsByClassName ('personLine');
	var i = div.length;
	while (i--)
	{
		calender.removeChild (div[i]);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				document.getElementById ('itemHeader').innerHTML = '<b>Innamekalender van ' + row['naam'] + '</b>';
				fillCalenderStep2 (row['id']);
				currentUser = row['naam'];
			}
			else
				document.getElementById ('itemHeader').innerHTML = '<b>Innamekalender</b>';
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
			for (var i = 0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				div = document.createElement ('div');
				div.className = 'personLine large standardWhite';
				div.setAttribute ('data-tijd', row['tijdID']);
				var szHTML = row['tijdNaam'];
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
				var tijden = calender.getElementsByClassName ('personLine');
				for (var i = 0; i < tijden.length; i++)
				{
					tijd = (tijden[i].getAttribute ('data-tijd')
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
