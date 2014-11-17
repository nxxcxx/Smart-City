
// override default clone to also clone material
THREE.Object3D.prototype.clone = function(object, recursive) { 

	if ( object === undefined ) object = new THREE.Object3D();
	if ( recursive === undefined ) recursive = true;

	object.name = this.name;

	object.up.copy( this.up );

	object.position.copy( this.position );
	object.quaternion.copy( this.quaternion );
	object.scale.copy( this.scale );

	object.renderDepth = this.renderDepth;

	object.rotationAutoUpdate = this.rotationAutoUpdate;

	object.matrix.copy( this.matrix );
	object.matrixWorld.copy( this.matrixWorld );

	object.matrixAutoUpdate = this.matrixAutoUpdate;
	object.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;

	if (object.material && this.material) {
		object.material = this.material.clone();
	}

	object.visible = this.visible;

	object.castShadow = this.castShadow;
	object.receiveShadow = this.receiveShadow;

	object.frustumCulled = this.frustumCulled;

	object.userData = JSON.parse( JSON.stringify( this.userData ) );

	if ( recursive === true ) {

		for ( var i = 0; i < this.children.length; i ++ ) {

			var child = this.children[ i ];
			object.add( child.clone() );

		}

	}

	return object;
};

THREE.Object3D.prototype.setDefaultPos = function(x, y, z, rx, ry, rz) {
	this.position.set(x, y, z);
	this.oripos = this.position.clone();
	this.orirot = this.rotation.clone();
	if (rx && ry && rz) {
		this.rotation.set(rx, ry, rz);
		this.orirot = this.rotation.clone();
	}
};

// animation methods
THREE.Object3D.prototype.animateResetPos = function () {
	
	if (!this.oripos && !this.orirot) return;

	// reset position
	new TWEEN.Tween( this.position ).to( {
		x: this.oripos.x,
		y: this.oripos.y,
		z: this.oripos.z }, 
		1000 )
	.easing( TWEEN.Easing.Quadratic.Out)
	.start();
	// reset rotation
	new TWEEN.Tween( this.rotation ).to( {
		x: this.orirot.x,
		y: this.orirot.y,
		z: this.orirot.z }, 
		1000 )
	.easing( TWEEN.Easing.Quadratic.Out)
	.start();
};


THREE.Object3D.prototype.animatePos = function (x, y, z) {
	new TWEEN.Tween( this.position ).to( {
		x: x,
		y: y,
		z: z }, 
		1000 )
	.easing( TWEEN.Easing.Quadratic.Out)
	.start();
};

THREE.Object3D.prototype.animateY = function (y) {
	new TWEEN.Tween( this.position ).to( {
		y: y}, 
		1000 )
	.easing( TWEEN.Easing.Quadratic.Out)
	.start();
};