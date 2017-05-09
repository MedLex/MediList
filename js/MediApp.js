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

function initTables (db)
{
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS overzichten(id integer primary key,'
														    + 'apotheek text,'
		                                                    + 'datum text,'
														    + 'patient text'
														    + 'geboren text)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS medicatie  (overzicht integer,'
														    + 'regel integer,'
		                                                    + 'datum text,'
														    + 'voorschrijver text'
															+ 'medicijn text,'
															+ 'dosering text,'
															+ 'start text,'
															+ 'end text,'
															+ 'duur integer,'
															+ 'toediening text,'
															+ 'toelichting text,'
															+ 'herhaling bool,'
														    + 'code text)');
	}, function (error)
	{
		alert ('er is een fout opgetreden\r\n' + error.message);
	});
}
*/

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

function readTag ()
{
	nfc.addNdefListener(
		function()
		{
			myAlert("Found an NDEF formatted tag");
		},
		function()
		{
			console.log("Success.");
		},
		function()
		{
			console.log("Fail.");
		}
	);
}
