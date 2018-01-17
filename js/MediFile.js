// Wait for Cordova to load
    //
    function onLoad()
	{
        document.addEventListener("deviceready", onDeviceReady, false);
    }

    // Cordova is ready
    //
    function onDeviceReady()
	{
		// Now we want access to the filesystem
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
		QRScanner = require('QRScanner');
		QRScanner.prepare(onDone); // show the prompt
	}

	function onDone(err, status)
	{
		if (err)
		{
			// here we can handle errors and clean up any loose ends.
			console.error(err);
		}
		if (status.authorized)
		{
			// W00t, you have camera access and the scanner is initialized.
			// QRscanner.show() should feel very fast.
		}
		else if (status.denied)
		{
			// The video preview will remain black, and scanning is disabled. We can
			// try to ask the user to change their mind, but we'll have to send them
			// to their device settings with `QRScanner.openSettings()`.
		}
		else
		{
			// we didn't get permission, but we didn't get permanently denied. (On
			// Android, a denial isn't permanent unless the user checks the "Don't
			// ask again" box.) We can ask again at the next relevant opportunity.
		}
    }

    function gotFS(fileSystem)
	{
		// We have got access
        fileSystem.root.getFile("readme.txt", null, gotFileEntry, fail);
    }

    function gotFileEntry(fileEntry)
	{
        fileEntry.file(gotFile, fail);
    }

    function gotFile(file)
	{
        readDataUrl(file);
        readAsText(file);
    }

    function readDataUrl(file)
	{
        var reader = new FileReader();
        reader.onloadend = function(evt)
		{
            console.log("Read as data URL");
            console.log(evt.target.result);
        };
        reader.readAsDataURL(file);
    }

    function readAsText(file)
	{
        var reader = new FileReader();
        reader.onloadend = function(evt)
		{
            console.log("Read as text");
            console.log(evt.target.result);
        };
        reader.readAsText(file);
    }

    function fail(evt)
	{
        console.log(evt.target.error.code);
    }
