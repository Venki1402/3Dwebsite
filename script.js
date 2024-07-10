let scene,
  camera,
  renderer,
  trees = [],
  obstacles = [];
let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false,
  isJumping = false;
let mouseDown = false,
  mouseX = 0,
  mouseY = 0;
let velocity = 0,
  gravity = -9.8,
  jumpForce = 5;
let score = 0;
let isGameOver = false;
let collectSound, gameOverSound;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add ground
  const groundGeometry = new THREE.PlaneGeometry(100, 100);
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228b22 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Add trees
  for (let i = 0; i < 50; i++) {
    createTree();
  }

  // Add obstacles
  for (let i = 0; i < 10; i++) {
    createObstacle();
  }

  camera.position.set(0, 2, 20);
  camera.lookAt(0, 2, 0);

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousemove", onMouseMove);

  // Initialize sounds
  collectSound = new Audio(
    "https://freesound.org/data/previews/270/270404_5123851-lq.mp3"
  );
  gameOverSound = new Audio(
    "https://freesound.org/data/previews/66/66951_634166-lq.mp3"
  );

  animate();
}

function createTree() {
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
  const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

  const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
  const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.y = 2;

  const tree = new THREE.Group();
  tree.add(trunk);
  tree.add(leaves);

  tree.position.x = Math.random() * 100 - 50;
  tree.position.z = Math.random() * 100 - 50;

  scene.add(tree);
  trees.push(tree);
}

function createObstacle() {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshBasicMaterial({
    color: Math.random() > 0.3 ? 0x0000ff : 0xff0000,
  });
  const obstacle = new THREE.Mesh(geometry, material);

  obstacle.position.x = Math.random() * 80 - 40;
  obstacle.position.z = Math.random() * 80 - 40;
  obstacle.position.y = 1;

  scene.add(obstacle);
  obstacles.push(obstacle);
}

function onKeyDown(event) {
  if (isGameOver) return;
  switch (event.keyCode) {
    case 38: // up arrow
      moveForward = true;
      break;
    case 40: // down arrow
      moveBackward = true;
      break;
    case 37: // left arrow
      moveLeft = true;
      break;
    case 39: // right arrow
      moveRight = true;
      break;
    case 32: // space
      if (!isJumping) {
        isJumping = true;
        velocity = jumpForce;
      }
      break;
  }
}

function onKeyUp(event) {
  if (isGameOver) return;
  switch (event.keyCode) {
    case 38: // up arrow
      moveForward = false;
      break;
    case 40: // down arrow
      moveBackward = false;
      break;
    case 37: // left arrow
      moveLeft = false;
      break;
    case 39: // right arrow
      moveRight = false;
      break;
  }
}

function onMouseDown(event) {
  if (isGameOver) return;
  mouseDown = true;
  mouseX = event.clientX;
  mouseY = event.clientY;
}

function onMouseUp(event) {
  if (isGameOver) return;
  mouseDown = false;
}

function onMouseMove(event) {
  if (isGameOver) return;
  if (mouseDown) {
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;

    camera.rotation.y -= deltaX * 0.01;
    camera.rotation.x -= deltaY * 0.01;

    mouseX = event.clientX;
    mouseY = event.clientY;
  }
}

function gameOver() {
  isGameOver = true;
  document.getElementById("gameOver").style.display = "block";
  gameOverSound.play();
}

function animate() {
  requestAnimationFrame(animate);

  if (!isGameOver) {
    const speed = 0.1;
    if (moveForward) camera.translateZ(-speed);
    if (moveBackward) camera.translateZ(speed);
    if (moveLeft) camera.translateX(-speed);
    if (moveRight) camera.translateX(speed);

    // Apply gravity and jumping
    if (isJumping) {
      camera.position.y += velocity * 0.016; // Assuming 60 FPS
      velocity += gravity * 0.016;

      if (camera.position.y <= 2) {
        camera.position.y = 2;
        isJumping = false;
        velocity = 0;
      }
    }

    // Check collisions with obstacles
    obstacles.forEach((obstacle, index) => {
      if (camera.position.distanceTo(obstacle.position) < 1.5) {
        if (obstacle.material.color.getHex() === 0x0000ff) {
          // Blue box - increase score
          scene.remove(obstacle);
          obstacles.splice(index, 1);
          score++;
          document.getElementById("score").textContent = `Score: ${score}`;
          createObstacle(); // Create a new obstacle to replace the collected one
          collectSound.play();
        } else {
          // Red box - game over
          gameOver();
        }
      }
    });
  }

  renderer.render(scene, camera);
}

init();
