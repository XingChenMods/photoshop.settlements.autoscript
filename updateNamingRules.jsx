#target photoshop

function updateNamingRules() {
  var doc = app.activeDocument;
  var updatedNameCount = 0;
  var skippedNameCount = 0;

  // Function to apply naming rules
  function applyNamingRules(text) {
    var result = text;
    if(result){
      if(text.indexOf('_') !== -1){
        result = result.replace(/_/g, '.');
      }
      if(text.indexOf('town') !== -1){
        result = result.replace(/town/g, 't');
      }
      if(text.indexOf('fort') !== -1){
        result = result.replace(/fort/g, 'f');
      }
      if(text.indexOf('village') !== -1){
        result = result.replace(/village/g, 'v');
      }
      if(text.indexOf('pass') !== -1){
        result = result.replace(/pass/g, 'p');
      }
    }
    return result;
  }

  // Function to process a single layer or layer group recursively
  function processLayer(layer) {
      if (layer.typename === "LayerSet") {
        // Process layer group
        var newName = applyNamingRules(layer.name);
        if (newName && newName !== layer.name) {
          layer.name = newName;
          updatedNameCount++;
        } else {
          skippedNameCount++;
        }

        // Recursively process all layers within the group
        for (var i = 0; i < layer.layers.length; i++) {
          processLayer(layer.layers[i]);
        }

      } else if (layer.typename === "ArtLayer") {
        // Process art layer
        var newName = applyNamingRules(layer.name);
        if (newName && newName !== layer.name) {
          layer.name = newName;
          if (layer.kind === LayerKind.TEXT) {
            // Update text content
            layer.textItem.contents = newName;
          }
          updatedNameCount++;
        } else {
          skippedNameCount++;
        }
      }
  }

  // Process all top-level layers in the document
  for (var i = 0; i < doc.layers.length; i++) {
    processLayer(doc.layers[i]);
  }

  // Show completion message
  alert("Naming rules update completed!\n\n" +
        "Name Updated: " + updatedNameCount + " items\n" +
        "Name Skipped: " + skippedNameCount + " items\n\n" +
        "Rules applied:\n" +
        "• '_' → '.'\n" +
        "• 'town' → 't'\n" +
        "• 'fort' → 'f'\n" +
        "• 'village' → 'v'\n" +
        "• 'pass' → 'p'");
}

// Run the function
app.activeDocument.suspendHistory("Update Naming Rules", "updateNamingRules()");
