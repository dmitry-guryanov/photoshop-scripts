const webSize = 2304
const webSharpenAmount = 40
const webSharpenRadius = 0.5

const printUnsharpAmount = 40
const printUnsharpRadius = 3

const preSaveAction = ""
const preSaveActionGroup = ""

const jpegQuality = 10


function smartSharpen(amount, radius)
{
var id4 = stringIDToTypeID( "smartSharpen" );
    var desc2 = new ActionDescriptor();
    var id5 = charIDToTypeID( "Amnt" );
    var id6 = charIDToTypeID( "#Prc" );
    desc2.putUnitDouble( id5, id6, amount );
    var id7 = charIDToTypeID( "Rds " );
    var id8 = charIDToTypeID( "#Pxl" );
    desc2.putUnitDouble( id7, id8, radius );
    var id9 = charIDToTypeID( "Thsh" );
    desc2.putInteger( id9, 0 );
    var id10 = charIDToTypeID( "Angl" );
    desc2.putInteger( id10, 0 );
    var id11 = stringIDToTypeID( "moreAccurate" );
    desc2.putBoolean( id11, true );
    var id12 = charIDToTypeID( "blur" );
    var id13 = stringIDToTypeID( "blurType" );
    var id14 = stringIDToTypeID( "lensBlur" );
    desc2.putEnumerated( id12, id13, id14 );
    var id15 = stringIDToTypeID( "preset" );
    desc2.putString( id15, "Default" );
    var id16 = charIDToTypeID( "sdwM" );
        var desc3 = new ActionDescriptor();
        var id17 = charIDToTypeID( "Amnt" );
        var id18 = charIDToTypeID( "#Prc" );
        desc3.putUnitDouble( id17, id18, 0.000000 );
        var id19 = charIDToTypeID( "Wdth" );
        var id20 = charIDToTypeID( "#Prc" );
        desc3.putUnitDouble( id19, id20, 50.000000 );
        var id21 = charIDToTypeID( "Rds " );
        desc3.putInteger( id21, 1 );
    var id22 = stringIDToTypeID( "adaptCorrectTones" );
    desc2.putObject( id16, id22, desc3 );
    var id23 = charIDToTypeID( "hglM" );
        var desc4 = new ActionDescriptor();
        var id24 = charIDToTypeID( "Amnt" );
        var id25 = charIDToTypeID( "#Prc" );
        desc4.putUnitDouble( id24, id25, 0.000000 );
        var id26 = charIDToTypeID( "Wdth" );
        var id27 = charIDToTypeID( "#Prc" );
        desc4.putUnitDouble( id26, id27, 50.000000 );
        var id28 = charIDToTypeID( "Rds " );
        desc4.putInteger( id28, 1 );
    var id29 = stringIDToTypeID( "adaptCorrectTones" );
    desc2.putObject( id23, id29, desc4 );
executeAction( id4, desc2, DialogModes.NO );	
}


function getSaveFile(dirName, ext) {
	doc = app.activeDocument
	d = doc.fullName.parent
	if (d.name == "psd")
		d.changePath("..");
	d.changePath(dirName)
	if (!d.exists)
		d.create()
	f = new File(d.fullName)
	x =  doc.fullName.name.split(".");
	n = x[0]
	f.changePath(n + "." + ext)
	return f;
}

function saveJpeg(dirName) {
	f = getSaveFile(dirName, "jpeg");
	
	jpgSaveOptions = new JPEGSaveOptions()
	jpgSaveOptions.embedColorProfile = false
	jpgSaveOptions.formatOptions = FormatOptions.OPTIMIZEDBASELINE
	jpgSaveOptions.matte = MatteType.WHITE
	jpgSaveOptions.quality = jpegQuality
	
	app.activeDocument.saveAs(f, jpgSaveOptions, true, Extension.LOWERCASE)
}

function savePsd(dirName) {
	f = getSaveFile(dirName, "psd");
	
	psdSaveOptions = new PhotoshopSaveOptions()
	psdSaveOptions.alphaChannels = true
	psdSaveOptions.annotations = true
	psdSaveOptions.embedColorProfile = true
	psdSaveOptions.layers = true
	psdSaveOptions.spotColors = true

	app.activeDocument.saveAs(f, psdSaveOptions, true, Extension.LOWERCASE)
}

function resize2(wsize, hsize, s1, r1, s2, r2) {
	doc = app.activeDocument
	h = doc.height
	w = doc.width
	
	if (h >= w) {
		h2 = hsize
		w2 = h2 * w / h;
	} else {
		w2 = wsize
		h2 = w2 * h / w;
	}

	doc.resizeImage(2 * w2, 2 * h2, 100, ResampleMethod.BICUBICSMOOTHER);
	smartSharpen(s1, r1)
	doc.resizeImage(w2, h2, 100, ResampleMethod.BICUBICSHARPER);
	smartSharpen(s2, r2)
}

function resize(wsize, hsize, s2, r2) {
	doc = app.activeDocument
	h = doc.height
	w = doc.width
	
	if (h >= w) {
		h2 = hsize
		w2 = h2 * w / h;
	} else {
		w2 = wsize
		h2 = w2 * h / w;
	}

	doc.resizeImage(w2, h2, 100, ResampleMethod.BICUBICSHARPER);
	smartSharpen(s2, r2)
}


var originalUnit = preferences.rulerUnits
preferences.rulerUnits = Units.PIXELS

doc = app.activeDocument
savePsd("psd")

histFirst = doc.activeHistoryState

doc.flatten()
doc.bitsPerChannel = BitsPerChannelType.EIGHT;
if (preSaveAction !== "") {
	app.doAction(preSaveAction, preSaveActionGroup)
}
saveJpeg("fullsize")

layer = doc.layers[0]

hist1 = doc.activeHistoryState
layer.applyUnSharpMask (printUnsharpAmount, printUnsharpRadius, 0) 
saveJpeg("print")
doc.activeHistoryState = hist1

resize(webSize, webSize, webSharpenAmount, webSharpenRadius)
saveJpeg("web")


doc.activeHistoryState = histFirst
app.preferences.rulerUnits = originalUnit