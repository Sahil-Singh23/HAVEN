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

canvas.width = 1444;
canvas.height = 1024;
const socket = io();
let players = {}; // Store other players
let myPlayer = null; // Store the current player
let myPlayerId = null; // Store the current player's socket ID
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
    y: offset.y,
  },
  image: assets.foreground,
});
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

const movables = [background, ...boundaries, foreground];

const renderables = [
  background,
  ...boundaries,
  player,
  //collisionDebug,
  foreground,
];
function initializeSocketConnection() {
  const socket = io();

  // Connect to the server
  socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id);
    myPlayerId = socket.id;

    // Send player join information
    socket.emit("playerJoin", {
      username: window.username,
      position: {
        x: background.position.x,
        y: background.position.y,
      },
      sprite: "down",
      lastKey: lastKey,
    });

    // Store the player reference
    myPlayer = player;
  });

  // Handle existing players when joining
  socket.on("existingPlayers", (existingPlayers) => {
    console.log("Received existing players:", existingPlayers);

    // Add all existing players (except ourselves)
    for (const id in existingPlayers) {
      if (id !== myPlayerId) {
        addOtherPlayer(existingPlayers[id]);
      }
    }
  });

  // Handle new player joining
  socket.on("playerJoined", (newPlayer) => {
    console.log("New player joined:", newPlayer);
    addOtherPlayer(newPlayer);
  });

  // Handle player movement updates
  socket.on("playerMoved", (playerData) => {
    if (players[playerData.id]) {
      // Update the player's position and sprite
      players[playerData.id].position = playerData.position;
      players[playerData.id].image =
        players[playerData.id].sprites[playerData.sprite];
      players[playerData.id].lastKey = playerData.lastKey;
      players[playerData.id].animate = true;
    }
  });

  // Handle player disconnection
  socket.on("playerLeft", (playerId) => {
    console.log("Player left:", playerId);
    if (players[playerId]) {
      // Remove the player sprite from renderables
      const index = renderables.indexOf(players[playerId]);
      if (index > -1) {
        renderables.splice(index, 1);
      }

      // Delete the player
      delete players[playerId];
    }
  });

  // Set up interval to send our player's position
  setInterval(() => {
    if (myPlayer && socket.connected) {
      socket.emit("playerMovement", {
        position: {
          x: background.position.x,
          y: background.position.y,
        },
        sprite: getPlayerSpriteDirection(),
        lastKey: lastKey,
      });
    }
  }, 50); // Send 20 times per second

  return socket;
}
// Initialize socket connection when the game starts

// Modify the join-form handler to initialize the socket after login
document.getElementById("join-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username-input").value.trim();
  if (username) {
    // Hide login screen
    document.getElementById("login-screen").style.display = "none";

    // Show canvas and game message
    document.getElementById("game-canvas").style.display = "block";
    document.getElementById("gameMessage").style.display = "block";

    // Pass username to game logic
    window.username = username;

    // Initialize socket connection after login
    socket = initializeSocketConnection();
  }
});
function getPlayerSpriteDirection() {
  if (player.image === player.sprites.up) return "up";
  if (player.image === player.sprites.down) return "down";
  if (player.image === player.sprites.left) return "left";
  if (player.image === player.sprites.right) return "right";
  return "down"; // Default
}

// Helper function to add other players to the game
function addOtherPlayer(playerData) {
  const otherPlayer = new Sprite({
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

  // Set the correct sprite direction
  otherPlayer.image =
    otherPlayer.sprites[playerData.sprite] || otherPlayer.sprites.down;

  // Add the player to our local players object
  players[playerData.id] = otherPlayer;

  // Add player to renderables - after background but before foreground
  const foregroundIndex = renderables.indexOf(foreground);
  if (foregroundIndex > -1) {
    renderables.splice(foregroundIndex, 0, otherPlayer);
  } else {
    renderables.push(otherPlayer);
  }

  // Add player username display
  const usernameElement = document.createElement("div");
  usernameElement.textContent = playerData.username;
  usernameElement.className = "player-username";
  usernameElement.id = `username-${playerData.id}`;
  usernameElement.style.position = "absolute";
  usernameElement.style.color = "white";
  usernameElement.style.textShadow = "1px 1px 2px black";
  usernameElement.style.fontWeight = "bold";
  usernameElement.style.fontSize = "14px";
  usernameElement.style.textAlign = "center";

  document.body.appendChild(usernameElement);

  // Store the username element reference
  players[playerData.id].usernameElement = usernameElement;
}

// Modify the animation loop to update other players' username positions
function updateOtherPlayers() {
  for (const id in players) {
    const otherPlayer = players[id];

    // Update username position above player
    if (otherPlayer.usernameElement) {
      const offsetPositionX =
        canvas.width / 2 - (myPlayer.position.x - otherPlayer.position.x);
      const offsetPositionY =
        canvas.height / 2 - (myPlayer.position.y - otherPlayer.position.y);

      otherPlayer.usernameElement.style.left = `${
        offsetPositionX - otherPlayer.width / 2
      }px`;
      otherPlayer.usernameElement.style.top = `${offsetPositionY - 20}px`; // 20px above player
    }

    // Update animation frames
    if (otherPlayer.animate) {
      if (otherPlayer.frames.max > 1) {
        otherPlayer.frames.elapsed++;
      }

      if (otherPlayer.frames.elapsed % otherPlayer.frames.hold === 0) {
        if (otherPlayer.frames.val < otherPlayer.frames.max - 1) {
          otherPlayer.frames.val++;
        } else {
          otherPlayer.frames.val = 0;
        }
      }
    }
  }
}

document.getElementById("join-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username-input").value.trim();
  if (username) {
    // Hide login screen
    document.getElementById("login-screen").style.display = "none";

    // Show canvas and game message
    document.getElementById("game-canvas").style.display = "block";
    document.getElementById("gameMessage").style.display = "block";

    // Pass username to game logic
    window.username = username;

    // Initialize socket connection after login
    socket = initializeSocketConnection();
  }
});
function animate() {
  window.requestAnimationFrame(animate);

  renderables.forEach((renderable) => {
    renderable.draw();
  });
  updateOtherPlayers();
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
  const gameMessage = document.getElementById("gameMessage");
  let activeGame = null;
  let messageVisible = false;

  const gamePortals = [
    {
      name: "Memory Card Game",
      position: { x: -280, y: -55 },
      url: "https://snehasingh-25.github.io/MemoryCardGame/",
    },
    {
      name: "Tic Tac Toe",
      position: { x: -480, y: -55 },
      url: "https://snehasingh-25.github.io/Tic-Tac-Toe-/",
    },
    {
      name: "Solar System",
      position: { x: 25, y: 235 },
      url: "https://snehasingh-25.github.io/SolarSystem/",
    },
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
          gameMessage.classList.remove("hidden");
          gameMessage.classList.add("show");

          setTimeout(() => {
            gameMessage.classList.remove("show");
            gameMessage.classList.add("hidden");
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
      gameMessage.classList.remove("show");
      gameMessage.classList.add("hidden");
    }
  }

  window.addEventListener("keydown", (e) => {
    if ((e.key === "p" || e.key === "P") && messageVisible && activeGame) {
      const game = gamePortals.find((g) => g.name === activeGame);
      if (game) {
        window.open(game.url, "_blank");
      }
    }
  });

  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    console.log(
      `Map Offset → x: ${background.position.x}, y: ${background.position.y}`
    );
  }
  if (
    (socket && keys.w.pressed) ||
    keys.a.pressed ||
    keys.s.pressed ||
    keys.d.pressed
  ) {
    socket.emit("playerMovement", {
      position: {
        x: background.position.x,
        y: background.position.y,
      },
      sprite: getPlayerSpriteDirection(),
      lastKey: lastKey,
    });

    console.log(
      `Map Offset → x: ${background.position.x}, y: ${background.position.y}`
    );
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
