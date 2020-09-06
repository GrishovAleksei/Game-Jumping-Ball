const canvas = document.getElementById('playground')
const ctx = canvas.getContext('2d')

//variables
let score
let scoreText
let highscore
let highscoreText
let player
let gravity
let obstacles = []
let gameSpeed
let gameSpeedText
let keys = {}

//Event Listener
document.addEventListener('keydown', function (evt) {
  keys[evt.code] = true
})
document.addEventListener('keyup', function (evt) {
  keys[evt.code] = false
})

class Player {
  constructor (x, y, r, c) {
    this.x = x
    this.y = y
    this.r = r
    this.c = c
    
    this.dy = 0
    this.jumpForce = 15
    this.originalHeight =  2 * r
    this.grounded = false
  }

  Animate () {
    //Jump
    if (keys['Space'] || keys['ArrowUp']) {
      this.Jump()
    } else {
      this.jumpTimer = 0
    }

    this.y += this.dy

    //Gravity
    if (this.y + this.r < canvas.height) {
      this.dy += gravity
      this.grounded = false
    } else {
      this.dy = 0
      this.grounded = true
      this.y = canvas.height - this.r
    }

    this.Draw()
  }

  Jump () {
    if (this.grounded && this.jumpTimer == 0) {
      this.jumpTimer = 1
      this.dy = -this.jumpForce
    } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
      this.jumpTimer++
      this.dy = -this.jumpForce - (this.jumpTimer / 50)
    }
  }

  Draw () {
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false)
    ctx.fill();
  }
}

class Obstacle {
  constructor (x, y, w, h, c) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.c = c
    
    this.dx = -gameSpeed   
  }

  Update () {
    this.x += this.dx
    this.Draw()
    this.dx = -gameSpeed
  }
  
  Draw () {
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.fillRect(this.x, this.y, this.w, this.h)
    ctx.closePath()
  }
}

class Text {
  constructor (t, x, y, a, c, s) {
    this.t = t
    this.x = x
    this.y = y
    this.a = a
    this.c = c
    this.s = s
  }

  Draw () {
    ctx.beginPath()
    ctx.fillStyle = this.c
    ctx.font = this.s + 'px sans-serif'
    ctx.textAlign = this.a
    ctx.fillText(this.t, this.x, this.y)
    ctx.closePath()
  }
}

//Game Functions
function SpawnObstacle () {
  let size = RandomIntInRange(20, 70)
  let type = RandomIntInRange(0, 1)
  let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, 'blue')

  if (type == 1) {
    obstacle.y -= RandomIntInRange(0.1, 2.5) * player.r
  }
  obstacles.push(obstacle)
}
SpawnObstacle()

function RandomIntInRange (min, max) {
  return Math.round(Math.random() * (max - min) + min)
}

function Start () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight / 2

  ctx.font = "20px sans-serif"

  gameSpeed = 3
  gravity = 1

  score = 0
 
  if(localStorage.getItem('highscore')) {
    highscore = localStorage.getItem('highscore')
  } else  highscore = 0

  player = new Player(canvas.width / 2, canvas.height, 25, 'red' )

  scoreText = new Text("Score: " + score, 25, 50, "left", "#999999", "20")
  highscoreText = new Text("Highscore: " + highscore, 25, 25 , "left", "#999999", "20")
  gameSpeedText = new Text("Speed: " + gameSpeed, 25, 75, "left", "#999999", "20")

  requestAnimationFrame(Update)
}

//Spawn
let initialSpawnTimer = 200
let spawnTimer = initialSpawnTimer
function Update () {
  requestAnimationFrame(Update)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  spawnTimer--
  if(spawnTimer <= 0) {
    SpawnObstacle()
    spawnTimer = initialSpawnTimer - gameSpeed * 8

    if (spawnTimer < 60) {
      spawnTimer = 60
    }
  }

  //Spawn Enemies
  for (let i = 0; i < obstacles.length; i++) {
    let o = obstacles[i]

    if(o.x + o.w < 0) {
      setTimeout(() => obstacles.splice(i, 1),0)
      continue;
    }
    if (
      player.x - player.r < o.x + o.w &&
      player.x + player.r > o.x &&
      player.y - player.r < o.y + o.h &&
      player.y + player.r > o.y
    ) {
      obstacles = []
      score = 0
      spawnTimer = initialSpawnTimer
      gameSpeed = 3
      window.localStorage.setItem('highscore', highscore)
    }
    o.Update()
  }

  player.Animate()

  score++
  scoreText.t = "Score: " + score
  scoreText.Draw()

  if (score > highscore) {
    highscore = score
    highscoreText.t = "Highscore: " + highscore
  }

  highscoreText.Draw()
  
  gameSpeed += 0.002
  gameSpeedText.t = "Speed: " + gameSpeed
  gameSpeedText.Draw()
}

Start()