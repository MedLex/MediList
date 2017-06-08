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
															+ 'apotheekID TEXT,'
														    + 'apotheek TEXT,'
															+ 'listDag INTEGER,'
															+ 'listMaand INTEGER,'
															+ 'listJaar INTEGER,'
														    + 'patient INTEGER)');
		tx.executeSql ('CREATE TABLE IF NOT EXISTS medicatie  (lijst INTEGER,'
														    + 'regel INTEGER,'
		                                                    + 'datum TEXT,'
														    + 'voorschrijver TEXT,'
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

//-------------------------------------------------------------------------------------
// Toon de juiste medicatielijst. Stap1: vindt een geselecteerde gebruiker
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
			}
			else
				document.getElementById ('itemHeader').innerHTML = '<b>Er is nog niemand geselecteerd</b>';
		}), function (error)
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
	var recent = new Date (1900,1,1,1,1,1,1);
	var deze = new Date(1900,1,1,1,1,1,1);
	var listID = 0;
	var apotheek = '';
	var szHTML = document.getElementById ('itemHeader').innerHTML;
	
	db.transaction(function(tx)
	{
		tx.executeSql('SELECT * FROM lijsten WHERE patient = ' + id, [], function (tx, results)
		{
			if (results.rows.length == 0)
			{
				szHTML += '<br><span class="standard">er is nog geen lijst geregistreerd</span>';
				document.getElementById ('itemHeader').innerHTML = szHTML;
			}
			else
			{
				for (var i=0; i < results.rows.length; i++)
				{
					row = results.rows.item(i);
					deze.setFullYear (row['listJaar'], row['listMaand'],row['listDag']);
					if (deze > recent)
					{
						recent.setFullYear (row['listJaar'], row['listMaand'],row['listDag']);
						listID = row['id'];
						apotheek = row['apotheek'];
					}
				}
				if (recent.getFullYear () != 1900)
				{
					szHTML += '<br><span class="standard">lijst van ' + apotheek + ', ' + recent.getDate() + '-' + recent.getMonth() + '-' + recent.getFullYear() + '</span>';
					document.getElementById ('itemHeader').innerHTML = szHTML;
					showListStep3 (db, listID);
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
			alert ('lijst met id = ' + id + ', heeft ' + results.rows.length + ' entries');
			for (var i=0; i < results.rows.length; i++)
			{
				row = results.rows.item(i);
				div - document.createElement ('div');
				if (i%2)
					div.className = 'item standard200 standard';
				else
					div.className = 'item standard50 standard';
				div.setAttribute ('onmouseup', 'onShowMed(' + id + ', ' + row['regel'] + ');');
				szHTML = '<b>' + row['medicijn'] + '</b><br />';
				szHTML += row['dosering'];
				szHTML += '<div class="right-black"></div>';
				overzicht.appendChild (div);
			}
		}), function (error)
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
		tx.executeSql('SELECT * FROM medicatie WHERE lijst = ' + lijst + 'AND regel = ' + regel, [], function (tx, results)
		{
			if (results.rows.length < 1)
				myAlert ('Oeps, deze medicatie kon niet meer worden gevonden');
			else
			{
				row = results.rows.item(0);
				showPrescription (row['medicijn'],
	                        '<tr><td>Startdatum</td><td>:</td><td>' + row['start'] + '</td></tr>'
	                      + '<tr><td>Stopdatum</td><td>:</td><td>' + row['end'] + '</td></tr>'
	                      + '<tr><td>Dosering</td><td>:</td><td>' + row['dosering'] + '</td></tr>'
	                      + '<tr><td>Toelichting</td><td>:</td><td>' + row['toelichting'] + '</td></tr>'
	                      + '<tr><td>Toediening</td><td>:</td><td>' + row['toediening'] + '</td></tr>'
	                      + '<tr><td>Voorschrijver</td><td>:</td><td>' + row['voorschrijver'] + '</td></tr>');
			}
		}), function (error)
		{
			alert ('er is een fout opgetreden\r\n' + error.message);
		}, function ()
		{
		};
	});
}
