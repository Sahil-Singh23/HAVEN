const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
// Instead of directly accessing the canvas

//const DPR = window.devicePixelRatio || 1;

// // CSS display size
// const cssWidth = window.innerWidth;
// const cssHeight = window.innerHeight;

// // Set actual canvas size in pixels
// canvas.width = cssWidth * DPR;
// canvas.height = cssHeight * DPR;

// // Set CSS size to match window
// canvas.style.width = `${cssWidth}px`;
// canvas.style.height = `${cssHeight}px`;

// // Reset transform and scale drawing
// c.setTransform(1, 0, 0, 1, 0, 0);
// c.scale(DPR, DPR);

// c.imageSmoothingEnabled = false;

// const collisionsMap = []
// for (let i = 0; i < collisions.length; i += 64) {
//   collisionsMap.push(collisions.slice(i, 64 + i))
// }
// const boundaries = []
// const offset = {
//   x: -100,
//   y: -1570
// }
// collisionsMap.forEach((row, i) => {
//   row.forEach((symbol, j) => {
//     if (symbol === 14819)
//       boundaries.push(
//         new Boundary({
//           position: {
//             x: j * Boundary.width + offset.x,
//             y: i * Boundary.height + offset.y
//           }
//         })
//       )
//   })
// })
// const image = new Image();
// const playerDownImage = new Image()
// playerDownImage.src = './img/playerDown.png'

// const playerUpImage = new Image()
// playerUpImage.src = './img/playerUp.png'

// const playerLeftImage = new Image()
// playerLeftImage.src = './img/playerLeft.png'

// const playerRightImage = new Image()
// playerRightImage.src = './img/playerRight.png'
// // image.src = './img/mainMap.png';
// // image.onload = () => {
// //     c.drawImage(image, -100, -1570);
// //     c.drawImage(playerDownImage, canvas.width / 4+133, canvas.height / 7+10);
// // };

// const canvas = document.querySelector('canvas')
// const c = canvas.getContext('2d')

canvas.width = 1444;
canvas.height = 1024;
const socket = io();
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 66) {
  collisionsMap.push(collisions.slice(i, 66 + i));
}

const boundaries = [];
const offset = {
  x: -55,
  y: -935,
};

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 20943) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y,
          },
        })
      );
    }
  });
});


const assets = {
  mainMap: new Image(),
  playerDown: new Image(),
  playerUp: new Image(),
  playerLeft: new Image(),
  playerRight: new Image(),
  foreground: new Image(),
};

// Updated paths to match your structure
assets.foreground.src = "assets/images/foregroundObjects.png";
assets.mainMap.src = "assets/images/Map.png";
assets.playerDown.src = "assets/images/playerDown.png";
assets.playerUp.src = "assets/images/playerUp.png";
assets.playerLeft.src = "assets/images/playerLeft.png";
assets.playerRight.src = "assets/images/playerRight.png";

const player = new Sprite({
  position: {
    x: canvas.width / 4 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2,
  },
  image: assets.playerDown,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: assets.playerUp,
    left: assets.playerLeft,
    right: assets.playerRight,
    down: assets.playerDown,
  },
});

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: assets.mainMap,
});

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: assets.foreground,
})
const collisionDebug = {
  draw: function () {
    boundaries.forEach((boundary) => {
      c.fillStyle = "rgba(255, 0, 0, 0.3)"; // Semi-transparent red
      c.fillRect(
        boundary.position.x,
        boundary.position.y,
        Boundary.width,
        Boundary.height
      );
    });
  },
};
const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const movables = [
  background,
  ...boundaries,
  foreground
];

const renderables = [
  background,
  ...boundaries,
  player,
  //collisionDebug,
  foreground
];

function animate() {
  window.requestAnimationFrame(animate);

  renderables.forEach((renderable) => {
    renderable.draw();
  });

  let moving = true;
  player.animate = false;

  if (keys.w.pressed && lastKey === "w") {
    player.animate = true;
    player.image = player.sprites.up;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 5,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y += 5;
      });
    }
  } else if (keys.a.pressed && lastKey === "a") {
    player.animate = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 5,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x += 5;
      });
    }
  } else if (keys.s.pressed && lastKey === "s") {
    player.animate = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 5,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.y -= 5;
      });
    }
  } else if (keys.d.pressed && lastKey === "d") {
    player.animate = true;
    player.image = player.sprites.right;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 5,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) {
      movables.forEach((movable) => {
        movable.position.x -= 5;
      });
    }
  }
  const gameMessage = document.getElementById('gameMessage');
    let activeGame = null;
    let messageVisible = false;

    const gamePortals = [
        {
            name: 'Memory Card Game',
            position: { x: -280, y: -55 },
            url: 'https://snehasingh-25.github.io/MemoryCardGame/'
        },
        {
            name: 'Tic Tac Toe',
            position: { x: -480, y: -55 },
            url: 'https://snehasingh-25.github.io/Tic-Tac-Toe-/'
        },
        {
            name: 'Solar System',
            position: { x: 25, y: 235 },
            url: 'https://snehasingh-25.github.io/SolarSystem/'
        }
        // Add more games easily here 
    ];

    function checkGamePortalTrigger() {
        let matched = false;

        for (const portal of gamePortals) {
            const dx = Math.abs(background.position.x - portal.position.x);
            const dy = Math.abs(background.position.y - portal.position.y);

            if (dx < 10 && dy < 10) {
                if (!messageVisible || activeGame !== portal.name) {
                    activeGame = portal.name;
                    messageVisible = true;

                    gameMessage.innerText = `Press P to play the ${portal.name}!`;
                    gameMessage.classList.remove('hidden');
                    gameMessage.classList.add('show');

                    setTimeout(() => {
                        gameMessage.classList.remove('show');
                        gameMessage.classList.add('hidden');
                        messageVisible = false;
                    }, 5000);
                }
                matched = true;
                break;
            }
        }

        if (!matched && messageVisible) {
            messageVisible = false;
            activeGame = null;
            gameMessage.classList.remove('show');
            gameMessage.classList.add('hidden');
        }
    }

    window.addEventListener('keydown', (e) => {
        if ((e.key === 'p' || e.key === 'P') && messageVisible && activeGame) {
            const game = gamePortals.find(g => g.name === activeGame);
            if (game) {
                window.open(game.url, '_blank');
            }
        }
    });



    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        console.log(`Map Offset → x: ${background.position.x}, y: ${background.position.y}`)

    }
    checkGamePortalTrigger();
}

let lastKey = "";
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});

assets.mainMap.onload = () => animate();

window.addEventListener("keydown", (e) => {
  if (e.key === "c") {
    // Press 'c' to toggle collision visibility
    showCollisions = !showCollisions;
  }
});
