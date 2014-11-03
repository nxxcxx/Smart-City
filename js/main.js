
	function startScene() {

		createAndAssignMaterial( 'wastePlant'   , 'wastePlant'   );
		createAndAssignMaterial( 'hubStreetLine', 'hubStreetLine');
		createAndAssignMaterial( 'hubPlatform'  , 'hubPlatform'  );
		createAndAssignMaterial( 'hubBuilding'  , 'hubBuilding'  );

		var m = assetManager.getModel('hubBuilding').material;
		m.envMap = reflectionCube;
		//m.combine = THREE.MultiplyOperation; how envMap combine w/ map
		m.reflectivity = 1.0;

	}

	function createAndAssignMaterial(modelKey, textureKey) {

		var model = assetManager.getModel(modelKey);
		var texture = assetManager.getTexture(textureKey);

		var newMaterial = new THREE.MeshBasicMaterial({
			map: texture,
		});

		assetManager.addMaterial(modelKey, newMaterial);	// use modelName as materialName
		model.material = newMaterial;

		scene.add(model);
	}