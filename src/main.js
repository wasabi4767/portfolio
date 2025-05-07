import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { normalMap } from 'three/tsl';

const scene = new THREE.Scene();

const camera= new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
})

renderer.setPixelRatio( window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);
const geometry = new THREE.TorusKnotGeometry( 12, 1.7, 300, 20, 2, 3)
const material = new THREE.MeshStandardMaterial({ 
  color: 0xff5024,
  //wireframe: true,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  metalness: 0.9,
  roughness: 0.5,
  reflectivity: 1.0,
});
const torus = new THREE.Mesh(geometry, material);
//scene.add(torus)
torus.position.z = -4.5





const pointLight = new THREE.PointLight(0xffffff,120);
pointLight.position.set(0,0,0)

const ambientLight = new THREE.AmbientLight(0xffffff,4);
scene.add(pointLight, ambientLight)

//Helper
/*
const lightHelper = new THREE.PointLightHelper(pointLight)
const gridHelper = new THREE.GridHelper(200,50);
scene.add(lightHelper,gridHelper)
*/

//const controls = new OrbitControls(camera, renderer.domElement);

const stars = [];


function addStar(){
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff})
  const star = new THREE.Mesh( geometry, material);

  const [x,y,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x,y,z);
  scene.add(star);
  stars.push(star);
}

Array(200).fill().forEach(addStar)

//Set BackGround
//const spaceTexture = new THREE.TextureLoader().load('space.jpg');
//scene.background = spaceTexture;

const bgGeometry = new THREE.PlaneGeometry(400, 400, 128, 128);
const bgGeometry_2 = new THREE.PlaneGeometry(900, 400, 128, 128);

const bgMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    uniform float time;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // 波の動き（Y + Z方向）
      pos.y += sin(pos.x * 0.3 + time * 1.0) * 1.0;
      pos.y += sin(pos.y * 0.5 + time * 0.5) * 0.7;
      pos.z += sin(pos.x * 0.4 + time * 1.2) * 0.4;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    varying vec2 vUv;

    void main() {
      // 色に時間による変化を追加（サイバー風グラデーション）
      float pulse = sin(time + vUv.x * 10.0) * 0.1;
      vec3 color = vec3(
        0.15 + 0.2 * sin(vUv.x * 10.0 + time),   // R
        0.15 + 0.1 * sin(vUv.y * 20.0 + time * 0.8), // G
        0.25 + vUv.y * 0.3 + pulse               // B
      );
      color *= 1.2;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  uniforms: {
    time: { value: 0 },
  },
  side: THREE.DoubleSide,
  transparent: false,
});

const bgPlane = new THREE.Mesh(bgGeometry, bgMaterial);
bgPlane.position.z = -50;
bgPlane.position.y = -30;
scene.add(bgPlane);

const bgPlane_2 = new THREE.Mesh(bgGeometry_2, bgMaterial);
bgPlane_2.position.x = -200;
bgPlane_2.rotateY(190);
scene.add(bgPlane_2);

// Clockを作成（必要ならグローバルで）
const clock = new THREE.Clock();

// render loop の中で毎フレーム更新
function bg_animate() {
  requestAnimationFrame(bg_animate);

  // 時間の更新
  bgMaterial.uniforms.time.value = clock.getElapsedTime();
  bgPlane.position.y = Math.sin(clock.getElapsedTime() * 0.1) * 5 - 30;

  renderer.render(scene, camera);
}
bg_animate();




const wasabiTexture = new THREE.TextureLoader().load('wasabi.png');

const wasabi = new THREE.Mesh(
  new THREE.BoxGeometry(3,3,3),
  new THREE.MeshBasicMaterial({map: wasabiTexture})
)

scene.add(wasabi)

const moonTexture = new THREE.TextureLoader().load('moon.png')
const normalTexture = new THREE.TextureLoader().load('moon_normal.png')

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture
  })
)

scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

wasabi.position.z = -7;
wasabi.position.x = 2;


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  wasabi.rotation.y += 0.01;
  wasabi.rotation.z += 0.01;

  const newZ = THREE.MathUtils.clamp(t * -0.02, 0, 40);
  camera.position.z = newZ;
  //camera.position.x = t * -0.0002;
  //camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();



function createOrbitingSpheres(centerX, centerY, centerZ, count = 10, plane = 'XZ') {
  const group = [];
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xfafad2 });
    const sphere = new THREE.Mesh(geometry, material);

    const size = 0.5 + Math.random() * 2;
    sphere.scale.set(size, size, size);

    const a = 10 + Math.random() * 20;
    const b = 10 + Math.random() * 20;
    const speed = 0.001 + Math.random() * 0.003;
    const angle = Math.random() * Math.PI * 2;

    group.push({ mesh: sphere, a, b, speed, angle, center: new THREE.Vector3(centerX, centerY, centerZ) });
    scene.add(sphere);
  }
  return group;
}

const objectsGroup1 = createOrbitingSpheres(0, 0, 0);         // 中心
const objectsGroup2 = createOrbitingSpheres(50, -20, -20);     // 別の場所

let time = 0;
function animate(){
  requestAnimationFrame(animate);
  time += 0.01;

  bgMaterial.uniforms.time.value += 0.01;


  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  //controls.update();

  [objectsGroup1, objectsGroup2].forEach(group => {
    group.forEach(obj => {
      obj.angle += obj.speed;
  
      switch (obj.plane) {
        case 'YZ':
          obj.mesh.position.y = obj.center.y + obj.a * Math.cos(obj.angle);
          obj.mesh.position.z = obj.center.z + obj.b * Math.sin(obj.angle);
          obj.mesh.position.x = obj.center.x;
          break;
  
        case 'XY':
          obj.mesh.position.x = obj.center.x + obj.a * Math.cos(obj.angle);
          obj.mesh.position.y = obj.center.y + obj.b * Math.sin(obj.angle);
          obj.mesh.position.z = obj.center.z;
          break;
  
        case 'XZ':
        default:
          obj.mesh.position.x = obj.center.x + obj.a * Math.cos(obj.angle);
          obj.mesh.position.z = obj.center.z + obj.b * Math.sin(obj.angle);
          obj.mesh.position.y = obj.center.y + Math.sin(obj.angle * 2) * 2;
          break;
      }
    });
  });
  
  

  stars.forEach((star, i) => {
    star.position.y += Math.sin(time + i) * 0.001; // 上下にふわふわ
    star.position.x += Math.cos(time + i * 0.5) * 0.001; // 少し横揺れ
  });
  

  renderer.render(scene, camera);
}

animate()

function createOrbitLine(a, b, color = 0x8888ff) {
  const curve = new THREE.EllipseCurve(
    0, 0,           // 中心座標
    a, b,           // X半径 / Y半径（ここではXZ平面に描く）
    0, 2 * Math.PI, // 開始・終了角度
    false,
    0
  );

  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color });
  const line = new THREE.LineLoop(geometry, material);
  line.rotation.x = Math.PI / 2; // XZ平面に合わせる

  return line;
}

createOrbitLine();

document.addEventListener('DOMContentLoaded', () => {
  // セクションフェード処理
  const fadeSections = document.querySelectorAll("section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  fadeSections.forEach((section) => {
    section.classList.add("fade-in");
    observer.observe(section);
  });

  // メニュー開閉処理
  const menuToggle = document.getElementById('menu-toggle');
  const menuPanel = document.getElementById('menu-panel');
  const menuItems = document.querySelectorAll('.menu-item');

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener('click', () => {
      menuPanel.classList.toggle('active');
    });
  }

  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = document.querySelector(item.dataset.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        menuPanel.classList.remove('active');
      }
    });
  });

  //Projectスライダーに関する処理
  let currentIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const track = document.querySelector('.carousel-track');
const nextBtn = document.querySelector('.carousel-btn.next');
const prevBtn = document.querySelector('.carousel-btn.prev');

let autoPlayInterval;
const INTERVAL_TIME = 5000; // 5秒

function goToSlide(index) {
  const slideWidth = slides[0].clientWidth;
  track.style.transform = `translateX(-${slideWidth * index}px)`;
  currentIndex = index;
}

function nextSlide() {
  const nextIndex = (currentIndex + 1) % slides.length;
  goToSlide(nextIndex);
}

function prevSlide() {
  const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

function resetAutoPlay() {
  clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(nextSlide, INTERVAL_TIME);
}

// イベント設定
nextBtn.addEventListener('click', () => {
  nextSlide();
  resetAutoPlay();
});

prevBtn.addEventListener('click', () => {
  prevSlide();
  resetAutoPlay();
});

// 自動再生開始
autoPlayInterval = setInterval(nextSlide, INTERVAL_TIME);

});






