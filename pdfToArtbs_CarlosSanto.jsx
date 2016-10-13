/**
 * ai.jsx (c)MaratShagiev m_js@bk.ru 13.10.2016
 */

//@target illustrator-14

(function main () {
  /**
   *** UI START ***
   * */
  var win = new Window ("dialog", "MTools - Open Multipage PDF");

  var fileGroup = win.add ("group");

  var btnFile  = fileGroup.add ("button", undefined, "File...");
  var lblFonts = fileGroup.add ("statictext", undefined, "Unavailable\nFonts\nwill be\nsubstituted.", {multiline: true}); //

  var grpRight = win.add ("group");
  var txtFile  = grpRight.add ("edittext", undefined);

  var grpPanel   = grpRight.add ("group");
  var pagesPanel = grpPanel.add ("panel", undefined, "Page Range");
  var lblFrom    = pagesPanel.add ("statictext", undefined, "From:");
  var txtFrom    = pagesPanel.add ("edittext", undefined, 1);
  var lblTo      = pagesPanel.add ("statictext", undefined, "To:");
  var txtTo      = pagesPanel.add ("edittext", undefined, 1);

  var btnGroup  = grpPanel.add ("group");
  var btnOk     = btnGroup.add ("button", undefined, "Open");
  var btnCancel = btnGroup.add ("button", undefined, "Cancel");

  var lblStatus = grpRight.add ("statictext", undefined, "Open Multipage PDF requires CS4 or later...");

  win.orientation = pagesPanel.orientation = "row";
  win.alignChildren     = "right";
  fileGroup.orientation = "column";
  fileGroup.alignment   = "top";
  txtFile.alignment     = ["fill", "top"];
  lblStatus.alignment   = "left";

  grpRight.orientation = "column";
  btnGroup.orientation = "column";
  btnOk.enabled        = false;

  txtFrom.characters = txtTo.characters = 3;
  btnFile.active = true;

  win.helpTip      = "\u00A9 2012 Carlos Canto";
  grpRight.helpTip = "Not tested with a ridiculous amount of pages";

  btnFile.onClick = function () {
    txtFile.text  = "";
    btnOk.enabled = false;
    var fileRef   = File.openDialog ("Select PDF...", "*.pdf");
    fileRef       = new File (fileRef.fsName.replace ("file://", "")); // Lion fix by John Hawkinson

    if (fileRef != null && fileRef.exists) {
      txtFile.text  = fileRef.fsName;
      btnOk.enabled = true;
      txtTo.active  = true;
    }
  }

  btnOk.onClick = function () {
    convertPdfToArtbs ();
    win.close ();
  }

  txtFile.onDeactivate = function () {
    var file = File (txtFile.text);
    if (file.exists) {
      btnOk.enabled = true;
    } else {
      btnOk.enabled = false;
    }
  }

  win.center ();
  win.show ();
  /**
   *** UI END ***
   * */

  function convertPdfToArtbs () {
    var pdfLeft, pdfTop, firstArtbRect, artbRect, i, j, pageSpecs, newItem;

    $.hiresTimer;
    var from = txtFrom.text;
    var to   = txtTo.text;

    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
    var fileRef              = File (txtFile.text);

    var idoc = app.documents.add ();

    setMaxZero ();

    var pdfOptions          = app.preferences.PDFFileOptions;
    pdfOptions.pDFCropToBox = PDFBoxType.PDFBOUNDINGBOX;

    var spacing      = 10;
    var arrPagesInfo = [];

    for (j = from; j <= to; j++) {
      pdfOptions.pageToOpen = j;

      var pdfDoc     = open (fileRef, DocumentColorSpace.RGB);
      lblStatus.text = "\u00A9 2012 Carlos Canto - Opening page " + j;
      win.update ();
      var pdfLayer = pdfDoc.activeLayer;

      var items    = pdfLayer.pageItems;
      var tempGrp  = pdfDoc.groupItems.add ();
      tempGrp.name = "Page " + j;

      for (i = items.length - 1; i > 0; i--) {
        items[i].move (tempGrp, ElementPlacement.PLACEATBEGINNING);
      }

      var pdfw     = pdfDoc.width;
      var pdfh     = pdfDoc.height;
      var activeAB = pdfDoc.artboards[0];

      pdfLeft = activeAB.artboardRect[0];
      pdfTop  = activeAB.artboardRect[1];

      if (j == from) {
        firstArtbRect = activeAB.artboardRect;
        artbRect      = firstArtbRect;

      } else {

        if ((artbRect[2] + spacing + pdfw) >= 8494) {
          var ableft    = firstArtbRect[0];
          var abtop     = firstArtbRect[3] - spacing;
          var abright   = ableft + pdfw;
          var abbottom  = abtop - pdfh;
          firstArtbRect = [ableft, abtop, abright, abbottom];
        } else {
          var ableft   = pageSpecs[3][2] + spacing;
          var abtop    = pageSpecs[3][1];
          var abright  = ableft + pdfw;
          var abbottom = abtop - pdfh;
        }
        artbRect = [ableft, abtop, abright, abbottom];
      }

      var deltaX = tempGrp.left - pdfLeft;
      var deltaY = pdfTop - tempGrp.top;

      pageSpecs = [tempGrp.name, deltaX, deltaY, artbRect];
      arrPagesInfo.unshift (pageSpecs);

      newItem = tempGrp.duplicate (idoc, ElementPlacement.PLACEATBEGINNING);

      pdfDoc.close (SaveOptions.DONOTSAVECHANGES);
    }

    var ilayer = idoc.layers[idoc.layers.length - 1];
    for (k = arrPagesInfo.length - 1; k >= 0; k--) {

      var newAB     = idoc.artboards.add (arrPagesInfo[k][3]);
      var newLayer  = idoc.layers.add ();
      newLayer.name = arrPagesInfo[k][0]

      var igroup = ilayer.groupItems[k];

      igroup.left = newAB.artboardRect[0] + arrPagesInfo[k][1];
      igroup.top  = newAB.artboardRect[1] - arrPagesInfo[k][2];
      igroup.move (newLayer, ElementPlacement.PLACEATEND);

      lblStatus.text = "Repositioning page " + k;
      win.update ();
    }
    idoc.artboards[0].remove ();
    ilayer.remove ();

    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    var time                 = $.hiresTimer / 1000000;
    lblStatus.text           = "Copyright 2012 \u00A9 Carlos Canto";
    // alert (arrPagesInfo.length + " pages opened in " + time.toFixed (2) + " seconds");
  }
} ());
