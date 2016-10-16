/**
 * script.parent = CarlosCanto // 01/07/12;  v1.2-01/15/12
 * Lion fix by John Hawkinson 01/15/12
 * modify by (c)MaratShagiev m_js@bk.ru 13.10.2016
 */

//@target illustrator

(function main () {
  /**
   *** UI START ***
   * */
  var win = new Window ("dialog", "MTools - Open Multipage PDF");

  var fileGroup = win.add ("group");

  var btnFile  = fileGroup.add ("button", undefined, "File...");
  var lblFonts = fileGroup.add ("statictext", undefined, "Unavailable\nFonts\nwill be\nsubstituted.", {multiline: true});

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
    win.close ();
    convertPdfToArtbs ();
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
    $.hiresTimer;
    app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

    var WORK_AREA_SIZE = 16383, // 8494
        spacing        = 10,
        arrPagesInfo   = [],
        from           = txtFrom.text,
        to             = txtTo.text,
        fileRef        = File (txtFile.text),
        iDoc           = app.documents.add (),
        i, j,
        pdfDoc, pdfLeft, pdfLay, pdfTop, pdfW, pdfH,
        firstAbRect, abRect, newAb, actAb, abLeft, abTop, abRight, abBott,
        items, newItem,
        iGr, tmpGr,
        iLay, newLay,
        deltaX, deltaY,
        pageSpecs, time;

    _setMaxZero ();

    var pdfOptions          = app.preferences.PDFFileOptions;
    pdfOptions.pDFCropToBox = PDFBoxType.PDFBOUNDINGBOX;

    for (j = from; j <= to; j++) {
      pdfOptions.pageToOpen = j;

      pdfDoc         = open (fileRef, DocumentColorSpace.RGB);
      // lblStatus.text = "\u00A9 2012 Carlos Canto - Opening page " + j;
      // win.update ();
      pdfLay = pdfDoc.activeLayer;

      items      = pdfLay.pageItems;
      tmpGr      = pdfDoc.groupItems.add ();
      tmpGr.name = "Page " + j;

      for (i = items.length - 1; i > 0; i--) {
        items[i].move (tmpGr, ElementPlacement.PLACEATBEGINNING);
      }

      pdfW  = pdfDoc.width;
      pdfH  = pdfDoc.height;
      actAb = pdfDoc.artboards[0];

      pdfLeft = actAb.artboardRect[0];
      pdfTop  = actAb.artboardRect[1];

      if (j == from) {
        abLeft      = 0;
        abTop       = 0;
        abRight     = abLeft + pdfW;
        abBott      = abTop - pdfH;
        firstAbRect = [abLeft, abTop, abRight, abBott];
        abRect      = firstAbRect;
      } else {
        if ((abRect[2] + spacing + pdfW) >= WORK_AREA_SIZE) {
          abLeft      = firstAbRect[0];
          abTop       = firstAbRect[3] - spacing;
          abRight     = abLeft + pdfW;
          abBott      = abTop - pdfH;
          firstAbRect = [abLeft, abTop, abRight, abBott];
        } else {
          abLeft  = pageSpecs[3][2] + spacing;
          abTop   = pageSpecs[3][1];
          abRight = abLeft + pdfW;
          abBott  = abTop - pdfH;
        }
        abRect = [abLeft, abTop, abRight, abBott];
      }

      deltaX = tmpGr.left - pdfLeft;
      deltaY = pdfTop - tmpGr.top;

      pageSpecs = [tmpGr.name, deltaX, deltaY, abRect];
      arrPagesInfo.unshift (pageSpecs);

      newItem = tmpGr.duplicate (iDoc, ElementPlacement.PLACEATBEGINNING);

      pdfDoc.close (SaveOptions.DONOTSAVECHANGES);
    }

    iLay = iDoc.layers[iDoc.layers.length - 1];

    for (k = arrPagesInfo.length - 1; k >= 0; k--) {

      newAb       = iDoc.artboards.add (arrPagesInfo[k][3]);
      newLay      = iDoc.layers.add ();
      newLay.name = arrPagesInfo[k][0]

      iGr = iLay.groupItems[k];

      iGr.left = newAb.artboardRect[0] + arrPagesInfo[k][1];
      iGr.top  = newAb.artboardRect[1] - arrPagesInfo[k][2];
      iGr.move (newLay, ElementPlacement.PLACEATEND);

      // lblStatus.text = "Repositioning page " + k;
      // win.update ();
    }
    iDoc.artboards[0].remove ();
    iLay.remove ();

    app.userInteractionLevel = UserInteractionLevel.DISPLAYALERTS;
    // time                     = $.hiresTimer / 1000000;
    // lblStatus.text           = "Copyright 2012 \u00A9 Carlos Canto";
    // alert (arrPagesInfo.length + " pages opened in " + time.toFixed (2) + " seconds");

    /**
     * set the zero point of global rulers to top left corner of main work area
     *
     * used copy-past max-size-rectangle (16383*16383 pt)
     * and the Document.view property
     * */
    function _setMaxZero () {
      var WORK_AREA_SIZE  = 16383,
          d               = activeDocument,
          rect            = d.pathItems.rectangle (0, 0, WORK_AREA_SIZE, WORK_AREA_SIZE),
          artbMax,
          screenModeStore = d.views[0].screenMode;

      rect.stroked  = false;
      rect.selected = true;

      cut ();
      d.views[0].screenMode = ScreenMode.FULLSCREEN;
      d.views[0].zoom       = 64;
      d.views[0].zoom       = 0.0313;
      paste ();
      rect    = selection[0];
      artbMax = d.artboards.add (rect.geometricBounds);

      d.rulerOrigin                                                  = [0, d.height];
      d.artboards[d.artboards.getActiveArtboardIndex ()].rulerOrigin = [0, 0];

      rect.remove ();
      artbMax.remove ();

      d.views[0].screenMode = screenModeStore;
    }
  }

} ());
