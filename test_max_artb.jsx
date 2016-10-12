//@target illustrator-19

var d  = activeDocument;
var rect = d.pathItems.rectangle(0, 0, 16380, 16380);
rect.stroked = false;
rect.selected = true;
cut();
d.views[0].zoom = 0.1;
d.views[0].zoom = 0.04;
paste();
rect = selection[0];
rectBnds = rect.geometricBounds; 
var a = d.artboards.add(rectBnds );