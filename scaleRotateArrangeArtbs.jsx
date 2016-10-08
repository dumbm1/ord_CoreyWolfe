//@target illustrator-20
(function processArtbs () {
  var doc                = activeDocument,
      lays               = doc.layers,
      i, j,
      artbs              = [],
      gap = 10, x = 0, y = 0,
      columns            = 4,
      scaleFactor        = 50,
      angle              = 90;
  for (var i = 0; i < activeDocument.artboards.length; i++) {
    var obj = activeDocument.artboards[i];
    artbs.push (obj);
  }
  for (i = 0; i < lays.length; i++) {
    var lay = lays[i];
    lay.groupItems[0].resize (scaleFactor, scaleFactor, true, true, true, true, scaleFactor, Transformation.CENTER);
  }
  for (i = 0; i < lays.length; i++) {
    var lay = lays[i];
    lay.groupItems[0].rotate (angle, true, true, true, true, Transformation.CENTER);
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
    doc.artboards.add (lay.groupItems[0].geometricBounds);
  }
  for (i = artbs.length - 1; i >= 0; i--) {
    artbs[i].remove ();
  }
} ());
