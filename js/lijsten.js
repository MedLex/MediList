//---------------------------------------------------------------------------------
// lijsten.js
// Het omgaan met medicatielijsten (tonen, inlezen en zo)
//
function initTables (db)
{
	db.transaction (function (tx)
	{
		tx.executeSql ('CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY ASC,'
														    + 'naam TEXT,'
														    + 'gebJaar INTEGER,'
															+ 'gebMaand INTEGER,'
															+ 'gebDag INTEGER,'
															+ 'selected INTEGER)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS lijsten(id INTEGER PRIMARY KEY ASC,'
															+ 'apotheekID TEXT,'					// AGB code van de apotheek
														    + 'apotheek TEXT,'
															+ 'listDag INTEGER,'
															+ 'listMaand INTEGER,'
															+ 'listJaar INTEGER,'
														    + 'patient INTEGER)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS medicatie  (lijst INTEGER,'						// interne lijst ID
														    + 'regel INTEGER,'						// intern regelnummer
															+ 'uuid TEXT,'							// medicatie ID van het apotheeksysteem
		                                                    + 'transcriptTimestamp TEXT,'			// datum/tijd van registratie
		                                                    + 'dispenseTimestamp TEXT,'				// datum/tijd van uitlevering
														    + 'voorschrijverNaam TEXT,'				// wie heeft dit medicijn voorgeschreven
														    + 'voorschrijverAGB TEXT,'				// met zijn/haar AGB code
														    + 'voorschrijverSpec TEXT,'				// en specialisme
															+ 'startGebruik TEXT,'					// datum start gebruik
															+ 'eindGebruik TEXT,'					// datum eind gebruik
															+ 'hoeveelheid INTEGER,'				// double dosering
															+ 'codeUnit TEXT,'						// bijvoorbeeld ST, ML, etc
															+ 'zi TEXT,'							// medicatiecodering z-Index
															+ 'hpk TEXT,'							// handelsproductcode in de G-Standaard
															+ 'prk TEXT,'							// Prescriptiecode
															+ 'dispensedMedicationName TEXT,'		// naam op het doosje
															+ 'iterationCredit INTEGER,'			// hoeveelheid nog te herhalen
															+ 'iterationDate TEXT,'					// herhaaldatum
															+ 'text1 TEXT,'							// teksten
															+ 'text2 TEXT,'							// let op: kunnen html opmaak als bijvoorbeeld <br /> bevatten
															+ 'text3 TEXT,'							// bijvoorbeeld
															+ 'text4 TEXT,'							// 1 maal per dag 2 tabletten Kuur afmaken<br/>Eerst uiteen laten vallen in water
															+ 'text5 TEXT)');
	}, function (tx, error)
	{
		alert ('er is een fout opgetreden\r\n' + error.message);
	}, function ()							// Succes. Hoeven we niet meer te melden
	{
//		alert ('tables created');
	});
}

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap1: vind een geselecteerde gebruiker
//
function showList (db)
{
	var overzicht = document.getElementById ('overzicht');
	var div = overzicht.childNodes;
	var i = div.length;

	while (i-- > 0)			// verwijder alle regels uit een eventuele huidige lijst, behalve de header
	{
		if (div[i].id != 'itemHeader')
			overzicht.removeChild (div[i]);
	}
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM person WHERE selected = 1', [], function (tx, results)
		{
			if (results.rows.length > 0)
			{
				row = results.rows.item(0);
				document.getElementById ('itemHeader').innerHTML = '<b>Medicatielijst van ' + row['naam'] + '</b>';
				showListStep2 (db, row['id']);
				currentUser = row['naam'];
			}
			else
				document.getElementById ('itemHeader').innerHTML = '<b>Er is nog niemand geselecteerd</b>';
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap2: vindt de meest recente lijst van de geselecteerde
// gebruiker (zo er al een lijst is)
//
function showListStep2 (db, id)
{
	var recent   = new Date (1900,1,1,1,1,1,1);
	var deze     = new Date(1900,1,1,1,1,1,1);
	var listID   = 0;
	var apotheek = '';
	var szHTML   = document.getElementById ('itemHeader').innerHTML;
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM lijsten WHERE patient = ' + id, [], function (tx, results)
		{
			if (results.rows.length == 0)
			{
				szHTML += '<br><span class="standard">Er is nog geen lijst geregistreerd</span>';
				document.getElementById ('itemHeader').innerHTML = szHTML;
			}
			else
			{
				for (var i=0; i < results.rows.length; i++)
				{
					row = results.rows.item(i);
					deze.setFullYear (row['listJaar'], (row['listMaand']-1),row['listDag']);
					if (   deze > recent
						|| (   deze == recent
						    && row['id'] > listID))
					{
						recent.setFullYear (row['listJaar'], (row['listMaand']-1),row['listDag']);
						listID = row['id'];
						apotheek = row['apotheek'];
					}
				}
				if (recent.getFullYear () != 1900)
				{
					var d = formatDate (recent.getDate(), recent.getMonth()+1, recent.getFullYear());
					szHTML += '<br><span class="standard">Lijst van ' + apotheek + ', ' + d + '</span>';
					document.getElementById ('itemHeader').innerHTML = szHTML;
					showListStep3 (db, listID);
				}
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap3: Toon nu de gevonden, meest recente, lijst
//
function showListStep3 (db, id)
{
	var overzicht = document.getElementById ('overzicht');
	var div;
	var szHTML;
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + id, [], function (tx, results)
		{
//			alert ('lijst met id = ' + id + ', heeft ' + results.rows.length + ' entries');
			for (var i=0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				div = document.createElement ('div');
				div.className = 'item standard';
				div.onclick = function () { onShowMed (id, row['regel']) };
				szHTML = '<b>' + row['dispensedMedicationName'] + '</b><br />';
				szHTML += row['hoeveelheid'];
				szHTML += ' ';
				szHTML += row['codeUnit'];
				if (row['text1'] != '')
					szHTML += '<div class="warning" onmouseup="showWarning(' + id + ', ' + row['regel'] + ');"></div>';
				div.innerHTML = szHTML;
				overzicht.appendChild (div);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function onShowMed (lijst, regel)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + lijst + ' AND regel = ' + regel, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, deze medicatie kon niet meer worden gevonden');
			else
			{
				var szHTML = '';
				var row = results.rows.item(0);

				szHTML  = addDate (row['transcriptTimestamp'], 'Datum voorschrift');
				szHTML += addDate (row['dispenseTimestamp']  , 'Datum laatste levering');
				szHTML += addDate (row['startGebruik']       , 'Startdatum');
				szHTML += addDate (row['eindGebruik']        , 'Stopdatum');
				szHTML += '<tr><td>Dosering</td><td>:</td><td>'				+ row['hoeveelheid'] + ' ' + row['codeUnit']	+ '</td></tr>'
	                   +  '<tr><td>Voorschrijver</td><td>:</td><td>'		+ row['voorschrijverNaam']					+ '</td></tr>';
				if (row['iterationCredit'] > 0)
					szHTML += '<tr><td>Herhalingen</td><td>:</td><td>'		+ row['iterationCredit'] + '</td></tr>';
				if (row['text1'] != '')
				{
					szHTML += '<tr><td>Melding</td><td>:</td><td>'			+ row['text1'];
					if (row['text2'] != '')
						szHTML += '<br />' + row['text2'];
					if (row['text3'] != '')
						szHTML += '<br />' + row['text3'];
					if (row['text4'] != '')
						szHTML += '<br />' + row['text4'];
					if (row['text5'] != '')
						szHTML += '<br />' + row['text5'];
					szHTML += '</td></tr>';
				}
				showPrescription (row['dispensedMedicationName'],szHTML);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}

function addDate (dateString, label)
{
	var szHTML = '';
	var months = [
		'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
		'september', 'oktober', 'november', 'december' ];

	szHTML  = '<tr><td>';
	szHTML += label;
	szHTML += '</td><td>:</td><td>';
	if (dateString != '')
	{
		var date = new Date (dateString);
		var show = date.getDate ();
		show += ' ';
		show += months[date.getMonth ()];
		show += ' ';
		show += date.getFullYear ();
		szHTML += show;
	}
	szHTML += '</td></tr>';
	
	return szHTML;
}

function showWarning (lijst, regel)
{

	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + lijst + ' AND regel = ' + regel, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, deze medicatie kon niet meer worden gevonden');
			else
			{
				var szHTML = '<tr><td>Melding</td><td>:</td><td>'
				row = results.rows.item(0);

				if (row['text1'] != '')
				{
					szHTML += row['text1'];
					if (row['text2'] != '')
						szHTML += '<br />' + row['text2'];
					if (row['text3'] != '')
						szHTML += '<br />' + row['text3'];
					if (row['text4'] != '')
						szHTML += '<br />' + row['text4'];
					if (row['text5'] != '')
						szHTML += '<br />' + row['text5'];

				}
				else
					szHTML += 'Voor dit medicijn is geen melding</td></tr>';
				szHTML += '</td></tr>';
				showPrescription (row['dispensedMedicationName'],szHTML);
			}
		}), function (tx, error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}
