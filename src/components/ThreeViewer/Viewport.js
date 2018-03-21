import * as THREE from 'three';

//import Config from '../../data/config';

// Main webGL renderer class
export default class Viewport {
  constructor(scene, sceneHelper, camera, container) {
    // Properties
    this.scene = scene;
    this.sceneHelper = sceneHelper;
    this.camera = camera;
    this.container = container;

    // grid helper
    var grid = new THREE.GridHelper(50, 10, 0xbbbbbb, 0x888888);
    grid.visible = false;
    this.sceneHelper.add(grid);

    var axesHelper = new THREE.AxesHelper( 5 );
    axesHelper.visible = false;
    this.sceneHelper.add( axesHelper );

    var skyboxGeometry = new THREE.CubeGeometry(200, 200, 200);
    var skyboxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide });
    var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    this.scene.add(skybox);

    // Create WebGL renderer and set its antialias
    this.threeRenderer = new THREE.WebGLRenderer( { antialias: false } );
    this.threeRenderer.autoClear = false;
    this.threeRenderer.autoUpdateScene = false;
    this.threeRenderer.shadowMapEnabled = true;
    this.threeRenderer.shadowMapSoft = true;

    // Appends canvas
    var clearColor = 0xffffff;
    this.threeRenderer.setClearColor(clearColor);
    this.threeRenderer.setPixelRatio(window.devicePixelRatio); // For retina
    this.threeRenderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.container.appendChild(this.threeRenderer.domElement);

    // Shadow map options
    // this.threeRenderer.shadowMap.enabled = true;
    // this.threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Get anisotropy for textures
    //Config.maxAnisotropy = this.threeRenderer.getMaxAnisotropy();

    this.raycaster = new THREE.Raycaster;

    // Initial size update set to canvas container
    //this.resize();
    //this.render();

    // Listeners
    //this.container.addEventListener('DOMContentLoaded', () => this.updateSize(), false);
    //this.container.addEventListener('resize', () => this.updateSize(), false);
  }

  resize() {
    var width = this.container.offsetWidth
    var height = this.container.offsetHeight

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.threeRenderer.setSize(width, height);
  }

  render() {
    // Renders scene to canvas target
    this.scene.updateMatrixWorld();
    this.sceneHelper.updateMatrixWorld();

    this.threeRenderer.clear();
    this.threeRenderer.render(this.scene, this.camera);
    this.threeRenderer.render(this.sceneHelper, this.camera);
  }
}
