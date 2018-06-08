import * as THREE from 'three'
import TWEEN from 'tween.js'
import Viewport from './Viewport'
import Light from './Light'

import CameraControls from 'camera-controls';
CameraControls.install( { THREE: THREE } );

export default class ThreeViewer {

  constructor(container) {
    this.container = container

    this.width = this.container.offsetWidth
    this.height = this.container.offsetHeight

    // Main scene creation
    this.scene = new THREE.Scene()
    this.scene.name = 'Main Scene'

    // scene helper for 
    this.sceneHelper = new THREE.Scene()
    this.sceneHelper.name = 'Scene Helpers'

    var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
    this.scene.add( ambientLight );

    var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
    light1.castShadow = true;
    light1.shadowCameraVisible = true;
		light1.position.set( 10, 10, 5 ).normalize();
		this.scene.add( light1 );

    var pointLight = new THREE.PointLight(0xFFFFFF, 1, 100000);
    this.scene.add( pointLight );

    this.DEFAULT_CAMERA = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 4000)
    this.DEFAULT_CAMERA.name = 'Camera'
    //this.DEFAULT_CAMERA.lookAt(this.scene.position)
    this.DEFAULT_CAMERA.position.z = 20
    //this.DEFAULT_CAMERA.lookAt(new THREE.Vector3())

    // Start Three clock
    this.clock = new THREE.Clock()

    this.camera = this.DEFAULT_CAMERA.clone()

    this.objects = [];

    // Main renderer constructor
    this.renderer = new Viewport(this.scene, this.sceneHelper, this.camera, this.container)

    //this.controls = new Controls(this.camera, this.container);

    this.controls = new CameraControls( this.camera, this.container )

    /*
    this.add(new Cube({
      width: 10,
      height: 10,
      depth: 10
    }));
    */

    this.render()
  }

  setObject(object) {
    this.objects.push(object);
    this.scene.add(object);
    this.render()
  }

  resize() {
    this.renderer.resize()
  }

  clear() {
    for(var o of this.objects) {
      this.scene.remove(o);
    }
    this.render()
  }

  render() {

    // Delta time is sometimes needed for certain updates
    const delta = this.clock.getDelta()
    const needsUpdate = this.controls.update( delta )
    //if ( needsUpdate ) {
      //TWEEN.update()
      this.renderer.render()
    //}

    requestAnimationFrame(() => {
      this.render()
    })
  }

}
