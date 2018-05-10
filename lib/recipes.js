var fs=require("fs");var path=require("path");var functions=require("./functions");var recipesdirectory=path.normalize(`${process.cwd()}/../recipes/`);exports.init=init;function importRecipeFile(filename){if(path.extname(filename)===".json"){if(fs.existsSync(path.join(recipesdirectory+filename))){var entry;try{entry=JSON.parse(fs.readFileSync(path.join(recipesdirectory+filename),"utf8"))}catch(e){console.log(` [!] Error: Could not parse recipe ${filename}!`);return}if(typeof entry.symbol!=="undefined"){global.hybridd.asset[entry.symbol.toLowerCase()]=entry;console.log(` [i] found asset recipe ${filename}`)}if(typeof entry.id!=="undefined"){global.hybridd.source[entry.id.toLowerCase()]=entry;console.log(` [i] found source recipe ${filename}`)}}else{console.log(` [!] Error: Cannot load recipe ${filename}!`)}}}function recolveRecipeImport(baseId,history,id){if(typeof baseId==="string"){var splitBaseId=baseId.split("::");switch(splitBaseId.length){case 1:return resolveRecipeInheritance(splitBaseId[0],(history||[]).concat(id));case 2:return{[splitBaseId[1]]:resolveRecipeInheritance(splitBaseId[0],(history||[]).concat(id))[splitBaseId[1]]};default:console.log(` [!] Error: Recipe ${id} has ill-defined 'import' property. Expected "$BaseRecipe" or "$BaseRecipe::Property".`);return{}}}else{console.log(` [!] Error: Recipe ${id} has ill-defined 'import' property. Expected string or array of strings.`);return{}}}function resolveRecipeInheritance(id,history){if(history&&history.indexOf(id)!==-1){console.log(` [!] Error: Cyclic inheritance found for ${id}.`);return{}}var list;if(global.hybridd.asset.hasOwnProperty(id)){list=global.hybridd.asset}else if(global.hybridd.source.hasOwnProperty(id)){list=global.hybridd.source}else{console.log(` [!] Error: Recipe ${id} not found. Neither asset nor source.`);return null}var recipe=list[id];if(recipe.hasOwnProperty("import")){var newRecipe={};if(typeof recipe["import"]==="object"&&recipe["import"].isArray()){for(var index=0,len=recipe["import"].length;index<len;++index){var baseRecipe=recolveRecipeImport(recipe["import"][index],history,id);if(baseRecipe){functions.uglyMerge(newRecipe,baseRecipe)}else{console.log(` [!] Error: Failed import of ${recipe["import"][index]} to ${id}..`);return null}}}else{var baseRecipe=recolveRecipeImport(recipe["import"],history,id);if(baseRecipe){functions.uglyMerge(newRecipe,baseRecipe)}else{console.log(` [!] Error: Failed import of ${recipe["import"]} to ${id}.`);return null}}if(recipe.hasOwnProperty("quartz")){if(!newRecipe.hasOwnProperty("quartz")){newRecipe.quartz={}}functions.uglyMerge(newRecipe.quartz,recipe.quartz);delete recipe["quartz"]}functions.uglyMerge(newRecipe,recipe);list[id]=newRecipe;return newRecipe}else{return recipe}}function init(callbackArray){fs.readdir(recipesdirectory,function(err1,files){if(err1){console.log(` [!] warning: error when reading ${err1}`)}else{global.hybridd.asset={};global.hybridd.source={};global.hybridd.source["storage"]={id:"storage",module:"storage"};console.log(` [.] scanning recipes in ${recipesdirectory}`);files.sort().forEach(importRecipeFile);Object.keys(global.hybridd.asset).forEach(function(id){if(!resolveRecipeInheritance(id)){delete global.hybridd.asset[id];console.log(` [!] Error: Failed compiling recipe for ${id}.`)}});Object.keys(global.hybridd.source).forEach(function(id){if(!resolveRecipeInheritance(id)){delete global.hybridd.source[id];console.log(` [!] Error: Failed compiling recipe for ${id}.`)}})}functions.sequential(this.callbackArray)}.bind({callbackArray:callbackArray}))}