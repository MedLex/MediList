//--------------------------------------------------------------------
// (c) 2017, MedLex
//
var g_bDeviceIsReady	= false;
var __divName;
var db = null;

//---------------------------------------------------------------
// Cordova is ready
//
function onDeviceReady()
{
	g_bDeviceIsReady = true;
	
//    app.receivedEvent('deviceready');
	alert ('the device is ready');

    // Read NDEF formatted NFC Tags
	nfc.addTagDiscoveredListener(nfcTagDetected,
//    nfc.addNdefListener (onNfc,
        function ()						// success callback
		{
            myAlert("Waiting for NDEF tag");
        },
        function (error)				// error callback
		{
            myAlert("Error adding NDEF listener " + JSON.stringify(error));
        }
    );
	db = window.openDatabase("MediList.db", "1.0", "MediList", 200000);
	if (db)
	{
		initTables (db);
		populatePersons ();
	}
	else
		alert ('no database available!');

//	BuildOverzicht ();
}

//--------------------------------------------------------------
// Wait for Cordova to load
//
function init()
{
	g_bDeviceIsReady = false;
//    document.addEventListener("deviceready", onDeviceReady, false);
	setTimeout(function()
	{
		onDeviceReady ();
	}, 500);

}

function isDeviceReady ()
{
	return g_bDeviceIsReady;
}

//------------------------------------------------------------------------------------------------------
// Bedek alle onderliggende zaken met een semi-transparante waas
// Deze krijgt standaard als id '__brCover'. Die wordt later weggegooid bij de OK knop.
//
function Cover (bRespond)
{
    
    elemCover = document.createElement ('div');
        
    elemCover.style.cssText = 'position:absolute;left:0px;right:0px;top:0px;bottom:0px;opacity:0.2;background:#000;';
    elemCover.id = '__brCover';
    elemCover.style.transition = 'opacity 0.5s ease';
    elemCover.style.webkitTransition = 'opacity 0.5s ease';
	if (bRespond)
		elemCover.onclick = 'closemenu();';
    document.body.appendChild (elemCover);
}

//------------------------------------------------------------------------------------------------------
// Geef een alert
//
function myAlert (szText)
{

    var elemWrapper;
    var elemDiv;

    Cover ();    						// onderliggende tekst even bedekken
    elemWrapper = document.createElement ('div');		// wrapper voor alles
    elemWrapper.id = '__myAlert';				// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
    elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overflow:hidden;';
    elemWrapper.style.transition = 'opacity 0.5s ease';
    elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
                          + 'font-size:large;text-align:left;color:#000000;background-color:#FF9800;padding-left:15px;';
    elemDiv.innerHTML = 'Let op!';
    elemWrapper.appendChild (elemDiv);
    elemDiv = document.createElement ('div');
    elemDiv.id = '__brAlertText';
    elemDiv.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
                          + 'font-size:medium;text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;padding-right:15px;';
    elemDiv.innerHTML = szText;
    elemWrapper.appendChild (elemDiv);
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
                          + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;';
    elemDiv.setAttribute('onclick', 'onClickOK(\'__myAlert\');');
    elemDiv.setAttribute('onmouseup', 'onClickOK(\'__myAlert\');');
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

//------------------------------------------------------------------------------------------------------
// Geef een alert
//
function ShowPrescription (szHeader, szText)
{

    var elemWrapper;
    var elemDiv;
	var szHTML;

    Cover ();    						// onderliggende tekst even bedekken
    elemWrapper = document.createElement ('div');		// wrapper voor alles
    elemWrapper.id = '__myPrescription';				// met deze ID. Kunnen we hem straks bij de OK knop terugvinden om weg te gooien
    elemWrapper.style.cssText = 'position:absolute;width:80%;top:50%;left:50%;height:auto;background-color:#ffffff;padding:0;opacity:0;-moz-opacity:0;-khtml-opacity:0;overflow:hidden;box-shadow: 12px 12px 8px grey;';
    elemWrapper.style.transition = 'opacity 0.5s ease';
    elemWrapper.style.webkitTransition = 'opacity 0.5s ease';
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
                          + 'font-size:large;text-align:left;color:#000000;background-color:#FF9800;padding-left:15px;';
    elemDiv.innerHTML = szHeader;
    elemWrapper.appendChild (elemDiv);
    elemDiv = document.createElement ('div');
    elemDiv.id = '__brAlertText';
    elemDiv.style.cssText = 'position:relative;left:0px;right:0px;height:auto;padding-top:15px;padding-bottom:20px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
                          + 'font-size:medium;text-align:left;color:#000000;background-color:#ffffff;padding-left:15px;padding-right:15px;';
    szHTML  = '<table>';
    szHTML += szText;
    szHTML += '</table>';
    elemDiv.innerHTML = szHTML;
    elemWrapper.appendChild (elemDiv);
    elemDiv = document.createElement ('div');
    elemDiv.style.cssText = 'position:relative;width:100%;height:auto;padding-top:10px;padding-bottom:10px;border-bottom:solid 1px #afafaf;font-family:arial, helvetica, sans-serif;'
                          + 'font-size:medium;text-align:center;color:#000000;background-color:#ffffff;';
    elemDiv.setAttribute('onclick', 'onClickOK(\'__myPrescription\');');
    elemDiv.setAttribute('onmouseup', 'onClickOK(\'__myPrescription\');');
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

function onClickOK (szName)
{
	
    var elemCover = document.getElementById ('__brCover');
    var elemWrapper = document.getElementById (szName);
	
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
}

//---------------------------------------------------------------------------
// Maak een div zichtbaar of onzichtbaar
//
function setVisibility(id, nVisible)
{
    var test;
    var e;
    
    e = document.getElementById(id);
    if (!e)
        alert ('id \'' + id + '\' not found!');
    test = e.style.display;
    if (nVisible == 2)
    {
        if(e.style.display == 'block')
           e.style.display = 'none';
        else
           e.style.display = 'block';
    }
    else if (nVisible == 0)
        e.style.display = 'none';
    else
        e.style.display = 'block';
}
