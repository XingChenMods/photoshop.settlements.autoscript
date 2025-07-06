#target photoshop

/*
 * -------------------------------
 * Photoshop 自动化脚本
 * 读取定居点数据集，并在文件中使用模板图层组自动生成对应的定居点标记。
 * 使用方法： * 1. 下载定居点列表 CSV 文件，并使用如下命令将其为 SETTLEMENTS 数组：
 *    ```
 *    node csvToSettlements.js path/to/settlements.csv
 *    ```
 *    执行后，会在csv文件同目录下生成一个同名 .js 文件，内容为 SETTLEMENTS 数组。
 * 2. 将生成的 .js 文件中的 settlement 数组内容复制到此脚本中 SETTLEMENTS 数组变量中。
 * 3. 在 Photoshop 中打开定居点标记文件，其中应包含一个名为 "All Templates" 的图层组，
 *    该组下包含多个子图层组，每个子图层组的名称应为 "<Template> fort_village"、"<Template> town_village" 等，
 *    对应不同类型的定居点模板
 *    这些子图层组应包含至少两个文本图层，分别用于显示定居点名称和 ID。
 * 4. 在 PS 主菜单中选择“文件 > 脚本 > 浏览”，并选择本文件运行。它将整理所有定义的定居点，
 *    并在 "Generated" 图层组中生成对应的标记。
 * -------------------------------
 */

//TODO: Replace this array of SETTLEMENTS to process with the output from csvToSettlements.js
var SETTLEMENTS = [
  {
    "id": "t.ba1",
    "name": "巴"
  },
  {
    "id": "t.v.ba1.1",
    "name": "巴子"
  },
  {
    "id": "t.v.ba1.2",
    "name": "大足"
  },
  {
    "id": "t.ba2",
    "name": "朐忍"
  },
  {
    "id": "t.v.ba2.1",
    "name": "羊渠"
  },
  {
    "id": "f.ba1",
    "name": "宕渠"
  },
  {
    "id": "f.v.ba1.1",
    "name": "宕"
  },
  {
    "id": "f.ba2",
    "name": "兹方"
  },
  {
    "id": "f.v.ba2.1",
    "name": "兹"
  },
  {
    "id": "f.ba3",
    "name": "枳"
  },
  {
    "id": "f.v.ba3.1",
    "name": "枳"
  }
];
function processTemplateGroup() {
  var doc = app.activeDocument;

  // Function to determine template name based on ID prefix
  function getTemplateNameFromId(id) {
    if (id.indexOf("p.") === 0) {
      return "<Template> p";
    } else if (id.indexOf("t.v.") === 0) {
      return "<Template> t.v";
    } else if (id.indexOf("f.v.") === 0) {
      return "<Template> f.v";
    } else if (id.indexOf("t.") === 0) {
      return "<Template> t";
    } else if (id.indexOf("f.") === 0) {
      return "<Template> f";
    } else {
      return null; // Unknown prefix
    }
  } // 1. Find a group named "Template" in the document
  function findGroup(parent, groupName) {
    for (var i = 0; i < parent.layerSets.length; i++) {
      if (parent.layerSets[i].name === groupName) {
        return parent.layerSets[i];
      }
    }
    return null;
  }

  // Find the "All Templates" parent group first
  var allTemplatesGroup = findGroup(doc, "All Templates");
  if (!allTemplatesGroup) {
    alert("Error: Parent group named 'All Templates' not found.");
    return;
  }

  // Create or find the "Generated" parent group for organization
  var generatedGroup = findGroup(doc, "Generated");
  if (!generatedGroup) {
    generatedGroup = doc.layerSets.add();
    generatedGroup.name = "Generated";
  }
  // Workaround: create a fake layer for moving groups into the Generated group
  // This is necessary because Photoshop scripting does not allow moving groups directly into another group.
  var fakeLayer = doc.artLayers.add();
  fakeLayer.name = "Fake Layer for Grouping"; // Name the fake layer for clarity
  fakeLayer.move(generatedGroup, ElementPlacement.INSIDE);

  // A helper function to find the first text layer within a given layer or layerSet
  function findFirstTextLayer(layerOrSet) {
    if (layerOrSet.typename === "ArtLayer" && layerOrSet.kind === LayerKind.TEXT) {
      return layerOrSet;
    } else if (layerOrSet.typename === "LayerSet") {
      for (var j = layerOrSet.layers.length - 1; j >= 0; j--) {
        // Iterate top to bottom within sub-groups
        var foundText = findFirstTextLayer(layerOrSet.layers[j]);
        if (foundText) {
          return foundText;
        }
      }
    }
    return null;
  }

  // Process each settlement in the array
  var processedCount = 0;
  for (var s = 0; s < SETTLEMENTS.length; s++) {
    var settlement = SETTLEMENTS[s];
    var templateName = getTemplateNameFromId(settlement.id);

    if (!templateName) {
      alert("Warning: Unknown ID prefix for '" + settlement.id + "'. Skipping.");
      continue;
    } // Find the appropriate template group within the "All Templates" parent group
    var currentTemplateGroup = findGroup(allTemplatesGroup, templateName);
    if (!currentTemplateGroup) {
      alert("Warning: Template group '" + templateName + "' not found for '" + settlement.id + "'. Skipping.");
      continue;
    } // 2. Make a copy of this group and move it into the Generated group
    var newGroup = currentTemplateGroup.duplicate();
    newGroup.name = settlement.id + " " + settlement.name; // Set group name to "${id} ${name}"

    // Move the duplicated group into the Generated group
    try {
      newGroup.move(fakeLayer, ElementPlacement.PLACEAFTER);
    } catch (e) {
      alert("Warning: Could not move group '" + newGroup.name + "' into Generated group: " + e.message);
    }

    // 3. In the new group, from top to bottom:
    // Ensure the group is visible and its contents are not locked for script access
    newGroup.visible = true;

    // We'll iterate through the layers from top to bottom within the new group.
    // Photoshop's collection is indexed from bottom to top, so we need to
    // iterate backwards to go from top to bottom visually.

    var layersInGroup = newGroup.artLayers; // This gets only art layers (text, pixel layers)

    if (layersInGroup.length < 2) {
      alert("Warning: The '" + newGroup.name + "' group does not contain at least two art layers for text replacement.");
      continue;
    }

    // Array to store found text layers in order of appearance (top to bottom)
    var topToBottomTextLayers = [];

    // Iterate through all layers/layerSets in the new group from top to bottom
    // newGroup.layers is an array of all layers and layerSets directly within the group.
    // Iterating from length-1 down to 0 processes them from top to bottom visually.
    for (var i = newGroup.layers.length - 1; i >= 0; i--) {
      var layer = newGroup.layers[i];
      var textLayer = findFirstTextLayer(layer);
      if (textLayer) {
        topToBottomTextLayers.push(textLayer);
      }
    }

    if (topToBottomTextLayers.length === 0) {
      alert("Warning: No text layers found within the '" + newGroup.name + "' group.");
      continue;
    } // 3.1. In the first (top) layer, find the text object, and change its content to the settlement name
    if (topToBottomTextLayers[0]) {
      try {
        var firstTextLayer = topToBottomTextLayers[0];
        if (firstTextLayer.kind === LayerKind.TEXT) {
          firstTextLayer.textItem.contents = settlement.name;
        } else {
          alert("Warning: The first identified layer is not a text layer. Skipping name update for '" + settlement.id + "'.");
        }
      } catch (e) {
        alert("Error updating first text layer for '" + settlement.id + "': " + e.message);
      }
    } else {
      alert("Warning: Could not find the first text layer to update name for '" + settlement.id + "'.");
    }

    // 3.2. In the second layer, find the text object, and change its content to the settlement ID
    if (topToBottomTextLayers[1]) {
      try {
        var secondTextLayer = topToBottomTextLayers[1];
        if (secondTextLayer.kind === LayerKind.TEXT) {
          secondTextLayer.textItem.contents = settlement.id;
        } else {
          alert("Warning: The second identified layer is not a text layer. Skipping ID update for '" + settlement.id + "'.");
        }
      } catch (e) {
        alert("Error updating second text layer for '" + settlement.id + "': " + e.message);
      }
    } else {
      alert("Warning: Could not find the second text layer to update ID for '" + settlement.id + "'.");
    }

    processedCount++;
  } // End of SETTLEMENTS loop

  if (fakeLayer) {
    fakeLayer.remove();
  }
  alert("Script completed: " + processedCount + " settlements processed.");
}

// Run the function
app.activeDocument.suspendHistory("Process Template Group", "processTemplateGroup()");
