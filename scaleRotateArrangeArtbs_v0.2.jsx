//@target illustrator-14
(function processArtbs () {

  setMaxZero ();

  var i, j,
      d           = activeDocument,
      lays        = d.layers,
      groups      = [],
      tmpLay      = d.layers.add (),
      artbs       = [],
      gap         = 10,
      x           = 0,
      y           = 0,
      columns     = 4,
      scaleFactor = 50,
      angle       = 90;

  for (i = 0; i < activeDocument.artboards.length; i++) {
    var obj = activeDocument.artboards[i];
    artbs.push (obj);
  }

  for (i = 0; i < d.groupItems.length; i++) {
    groups.push (d.groupItems[i]);
  }

  var mainGr = tmpLay.groupItems.add ();

  for (i = 0; i < groups.length; i++) {
    var obj = groups[i];
    obj.move (mainGr, ElementPlacement.INSIDE);
  }

  mainGr.position = [mainGr.groupItems[0].height / 2, mainGr.groupItems[0].height / 2];

  try {
    for (i = 1, j = 0; i < activeDocument.layers.length; i++, j++) {
      var obj2 = activeDocument.layers[i];
      groups[j].move (obj2, ElementPlacement.INSIDE);
    }
  } catch (e) {
  }
  for (i = 0; i < groups.length; i++) {
    var obj3 = groups[i];
    obj3.rotate (angle, true, true, true, true, Transformation.CENTER);
  }
  tmpLay.remove ();

  for (i = 0; i < lays.length; i++) {
    var lay = lays[i];
    lay.groupItems[0].resize (scaleFactor, scaleFactor, true, true, true, true, scaleFactor, Transformation.TOPLEFT);
  }

  for (i = lays.length - 1 , j = 1; i >= 0; i--, j++) {
    var gr      = lays[i].groupItems[0];
    gr.position = [x, y];
    if (!(j % columns)) {
      y = gr.geometricBounds[3] - gap;
      x = 0;
    } else {
      x += gr.width + gap;
    }
  }
  for (i = 0; i < lays.length; i++) {
    var lay = lays[i];
    d.artboards.add (lay.groupItems[0].geometricBounds);
  }
  for (i = artbs.length - 1; i >= 0; i--) {
    artbs[i].remove ();
  }

  /**LIB*/
  function setMaxZero () {
    var d               = activeDocument,
        rect            = d.pathItems.rectangle (0, 0, 16000, 16000),
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
} ());
