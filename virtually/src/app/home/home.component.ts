import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ModelNames, maps } from './model/model.interface';
import { Observable, forkJoin } from 'rxjs';
import { MatDrawer } from '@angular/material/sidenav';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  controls: OrbitControls;
  gltfLoader: GLTFLoader;
  caster: THREE.Raycaster;
  models = maps;

  @ViewChild('canvas') canvasRef: ElementRef;
  @ViewChild('drawer') drawerRef: MatDrawer;
  @ViewChild('video') videoRef: ElementRef;

  currentView: ModelNames = ModelNames.PreMining;
  currentScene: THREE.Group[] = [];

  randomPosition: THREE.Vector3;
  pin: THREE.Group;

  scene$: Observable<any>;

  svgData:SafeResourceUrl;

  constructor(private readonly sanitizer: DomSanitizer, private readonly http: HttpClient) {  }
  ngOnInit(): void {
    this.http.get('assets/Northpoint.svg', { responseType: 'text' })
    .subscribe(svg => {
      const sanitizedSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
      this.svgData = sanitizedSvg;
    });

    this.gltfLoader = new GLTFLoader();
    this.scene = new THREE.Scene();

    this.caster = new THREE.Raycaster();
    this.loadAllAssets();

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 2, 3); // Set the position of the directional light
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040); // Set the color of the ambient light
    this.scene.add(ambientLight);

    this.initializeCnC();
  }
  ngAfterViewInit(): void {
    this.canvasRef.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('click', (e) => this.onClick(e), false);
    this.videoRef.nativeElement.src = 'assets/videos/Bowdens_Silver_Overview.mp4';
    this.videoRef.nativeElement.load() 
    this.animate();
  }

  animate() {
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(()=>this.animate())
  }

  loadAllAssets() {
    const obs = [];

    for(const [name, model] of this.models) {
      for(const m of model.assets) {
        obs.push(this.loadGltf(m, name));
      }
    }

    this.scene$ = forkJoin(obs);
    this.scene$.subscribe(observables => {

      for(const o of observables) {
        this.scene.add(o.scene);
      }

      this.hideAssets();
      const surface = this.scene.children.filter(v => v instanceof THREE.Group && v.visible)
      this.randomPosition = this.computeRandomPosition(surface as THREE.Group[]);

      this.loadMapPin(this.randomPosition, surface as THREE.Group[]);
   
    })
  }

  toggleViews(){
    this.currentView = this.currentView === ModelNames.Mining ? ModelNames.PreMining : ModelNames.Mining;
    this.hideAssets();
    const y = this.raycastYAxis(this.randomPosition,this.scene.children.filter(v => v instanceof THREE.Group && v.visible) as THREE.Group[])
    if (y){
      this.pin.position.setY(y)
    }
  }

  loadGltf(url: string, model: ModelNames): Observable<GLTF>{
    return new Observable((observer) => {
      this.gltfLoader.load(url,(gltf) => {
        const l = this.models.get(model);
        l ? l.scene?.push(gltf) : undefined;
        observer.next(gltf);
        observer.complete();
      }, undefined, (error) => observer.error(error))
    })
  }

  hideAssets(){
    const hiddenIds = this.models.get(this.currentView)?.scene?.map(x => x.scene.id);


    for(const a of this.scene.children) {
      if (hiddenIds?.find( i => i === a.id)) {
        a.visible = false;
      } else {
        a.visible = true;
      }
    }

  }

  loadMapPin(random: THREE.Vector3, surface:THREE.Group[]) {
    const y = this.raycastYAxis(random, surface);

    const objLoader = new OBJLoader();
    objLoader.load('assets/3d-assets/Map_Pin.obj', (pin: THREE.Group)=> {
      const material = new THREE.MeshStandardMaterial({
        color: '#673ab7',
        roughness:0.7,
        metalness:0.5
      })
      pin.position.x = random.x
      pin.position.y = y? y + 10 : 0;
      pin.position.z = random.z
      pin.scale.x = 100
      pin.scale.y = 100
      pin.scale.z = -100
      pin.rotation.x = Math.PI/2
      pin.traverse((ob)=>{
        if (ob instanceof THREE.Mesh) {
          ob.material = material
        }
      })
      this.pin = pin;

      this.scene.add(pin)
    })
  }

  createBoundingBox(surface: THREE.Group[]){
    const overallBoundingBox = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0));

    for (const group of surface) {
      for(const c of group.children) {
        if (c instanceof THREE.Mesh && c.name !== 'Terrain_Outer') {
          overallBoundingBox.expandByVector(c.geometry.boundingBox.max);
        }
      }
    }
    return overallBoundingBox;
  }

  computeRandomPosition(surface: THREE.Group[]) {
    const overallBoundingBox = this.createBoundingBox(surface);
    // Generate a random position within the bounding box
    const randomPosition = new THREE.Vector3();
    randomPosition.lerpVectors(overallBoundingBox.min, overallBoundingBox.max, Math.random());

    const v = new THREE.Vector3(randomPosition.x, 0, randomPosition.y);
    return v;
  }

  raycastYAxis(position: THREE.Vector3, plane: THREE.Group[]){
    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3(0, -1, 0); // Direction of the ray (downward in this case)
    const rayOrigin = new THREE.Vector3(position.x, 1000000, position.z); // Start position of the ray (above the plane)

    raycaster.set(rayOrigin, rayDirection);
    for(const group of plane) {
      const intersection = raycaster.intersectObject(group);
      if (intersection[0]?.point) {
        return intersection[0]?.point.y;
      }
    }
    return null;
  }

  onClick(event: MouseEvent){
    const mouse = new THREE.Vector2();

    // Calculate normalized device coordinates (NDC) of the mouse click
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.caster.setFromCamera(mouse, this.camera);
    const intersects = this.caster.intersectObjects(this.scene.children);
    if (intersects.length > 0) {
      if (intersects[0].object.name === '16723_Tack_PushPin_'){
        this.drawerRef.toggle();
      }
      console.log('Child object clicked:', intersects[0].object);
    }
  }

  initializeCnC() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/ window.innerHeight, 0.1  , 100000000);
    this.camera.position.x = 1000;
    this.camera.position.y = 1000;
    this.camera.position.z = 1000;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.controls = new OrbitControls(this.camera,this.renderer.domElement)
    this.controls.enablePan = true
    this.controls.panSpeed = 2
    this.controls.zoomSpeed = 2
  }
}

 