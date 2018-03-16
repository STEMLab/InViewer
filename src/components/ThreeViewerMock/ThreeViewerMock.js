import * as THREE from 'three';

class Cube {
  constructor(size) {
    this.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00ff00
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  update() {
    this.mesh.rotation.x += 0.1;
    this.mesh.rotation.y += 0.1;
  }

  getMesh() {
    return this.mesh;
  }
}

export default class ThreeViewerMock {
  constructor(container) {
    this.objects = [];
    this.container = container;
    this.createScene();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, this.container.offsetWidth / this.container.offsetHeight, 1, 2000);
    this.camera.position.z = 20;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.container.appendChild(this.renderer.domElement);

    this.render();

    this.add(new Cube({
      width: 10,
      height: 10,
      depth: 10
    }));
  }

  render() {
    requestAnimationFrame(() => {
      this.render();
    });

    this.objects.forEach((object) => {
      object.update();
    });

    this.renderer.render(this.scene, this.camera);
  }

  add(mesh) {
    this.objects.push(mesh);
    this.scene.add(mesh.getMesh());
  }
}
