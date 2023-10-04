
let canvas, ctx

const fontFamily = "'Pixelify Sans'"

const stageEnum = {
    MENU: 0,
    ANIMATION: 1,
    GAME: 2,
    LOSE: 3,
    WIN: 4,
}

const game = {
    stage: stageEnum.MENU,
    sprites: {
        ships: {
            img: new Image(),
            ships: [
                {sx: 64, sy: 71, swidth: 129, sheight: 106}, // nave 1
                {sx: 48, sy: 320, swidth: 161, sheight: 133}, // nave 2
                {sx: 32, sy: 561, swidth: 193, sheight: 147}, // nave 3
                {sx: 27, sy: 800, swidth: 201, sheight: 168}, // nave 4
                {sx: 29, sy: 1050, swidth: 202, sheight: 171}, // nave 5
                {sx: 76, sy: 1330, swidth: 107, sheight: 143}, // nave 6
                {sx: 72, sy: 1572, swidth: 110, sheight: 146}, // nave 7
                {sx: 30, sy: 1854, swidth: 198, sheight: 140}, // nave 8
                {sx: 27, sy: 2096, swidth: 202, sheight: 148}, // nave 9
                {sx: 80, sy: 2384, swidth: 95, sheight: 88}, // nave 10
                {sx: 30, sy: 2592, swidth: 199, sheight: 273}, // nave 11
                {sx: 28, sy: 2970, swidth: 201, sheight: 267}, // nave 12
            ]
        }
    },
    controls: {
        keyA: false,
        keyW: false,
        keyD: false,
        keySpace: false,
        selectIndex: 0,
        animationStart: null
    }
}

window.onload = () => {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Import imgs to the game
    game.sprites.ships.img.onload = startGame
    game.sprites.ships.img.src = './ships_0.png'
}

const startGame = () => {
    update()
    render()

    window.requestAnimationFrame(startGame)
}

const update = () => {
    const {stage, enemies, player, shots, controls} = game

    if (stage !== stageEnum.GAME) {
        return
    }

    if (enemies.length === 0) {
        game.stage = stageEnum.WIN
        return 
    }

    if (player.hp <= 0) {
        game.stage = stageEnum.LOSE
        return
    }

    const time = Date.now()

    game.shots = shots.filter(e => e.time + 1e3 > time && e.destroyed === false)

    game.enemies = enemies.map(enemy => {
        if (getRandomNumber(0, 100) === 1) {
            enemy.position.r += getRandomNumber(-20, -20)
        }

        if (
            enemy.position.y > canvas.height ||
            enemy.position.y < 0 ||
            enemy.position.x > canvas.width ||
            enemy.position.x < 0
        ) {
            enemy.position.r += 180
        }
        
        const shotReached = shots.find(shot => shot.fromPlayer && calcDistance(shot.position.x, shot.position.y, enemy.position.x + 100, enemy.position.y + 80) < 30)
        if (shotReached) {
            shotReached.destroyed = true
            enemy.hp -= player.damage
        }

        if (getRandomNumber(0, 200) === 1) {
            game.shots.push({
                time: Date.now(),
                destroyed: false,
                speed: 10,
                fromPlayer: false,
                position: {
                    x: enemy.position.x + 60,
                    y: enemy.position.y + 50,
                    r: enemy.position.r,
                }
            })
        }

        return enemy
    }).filter(e => e.hp > 0)

    if (controls.keySpace && player.lastShot + 5e2 < time) {
        player.lastShot = time
        game.shots.push({
            time: Date.now(),
            destroyed: false,
            speed: 10,
            fromPlayer: true,
            position: {
                x: game.player.position.x + 60,
                y: game.player.position.y + 50,
                r: game.player.position.r,
            }
        })
    }

    const shotReached = shots.find(shot => !shot.fromPlayer && calcDistance(shot.position.x, shot.position.y, player.position.x + 65, player.position.y + 80) < 30)
    if (shotReached) {
        shotReached.destroyed = true
        // Since all enemies have the same damage, I got the first one
        player.hp -= enemies[0].damage
    }

    if (
        player.position.y > canvas.height ||
        player.position.y < 0 ||
        player.position.x > canvas.width ||
        player.position.x < 0
    ) {
        player.position.r += 180
    }
    
    if (controls.keyW) {
        player.speed = 4
    } else {
        player.speed = 2
    }

    if (controls.keyA) {
        game.player.position.r -= 3
    }
    
    if (controls.keyD) {
        game.player.position.r += 3
    }

    [player, ...enemies, ...shots].forEach(e => {
        const radian = e.position.r * (Math.PI / 180);
        const deltaX = Math.sin(radian);
        const deltaY = Math.cos(radian);

        e.position.x += deltaX * e.speed
        e.position.y -= deltaY * e.speed
    })

}

const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const { MENU, ANIMATION, GAME, LOSE, WIN } = stageEnum

    switch (game.stage) {
        case MENU:
            drawStaticScene("Escolha a nave que vc deseja", '#2980b9', '#3498db')

            const YOffset = canvas.height * 0.5
            const XOffset = 100
            let lastWidth = XOffset

            for (let index = 0; index < game.sprites.ships.ships.length; index++) {
                const { sx, sy, swidth, sheight } = game.sprites.ships.ships[index]
                const { selectIndex } = game.controls
                lastWidth += (game.sprites.ships.ships[index - 1]?.swidth || 0) / 2 + 50

                ctx.drawImage(game.sprites.ships.img, sx, sy, swidth, sheight, lastWidth, YOffset, swidth / 2, sheight / 2);

                if (selectIndex === index) {
                    ctx.strokeStyle = 'white'
                    ctx.lineWidth = 10;
                    ctx.strokeRect(lastWidth - 10, YOffset- 10, swidth / 2 + 20, sheight / 2 + 20)
                } else {
                    ctx.strokeStyle = '#3498db'
                    ctx.lineWidth = 1;
                    ctx.strokeRect(lastWidth - 10, YOffset- 10, swidth / 2 + 20, sheight / 2 + 20)
                }
            }
            break;
        case ANIMATION:
            drawAnimation()
            break;
        case GAME:
            drawGame()
            break;
        case LOSE:
            drawStaticScene("Você perdeu!", '#2c3e50', '#34495e')
            break;
        case WIN:
            drawStaticScene("Você Venceu!", '#27ae60', '#2ecc71')
            break;
    }
}

const drawStaticScene = (title, bgColor, txtColor) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "90px " + fontFamily;
    ctx.fillStyle = txtColor;
    ctx.fillText(title, 50, 120);
}

const drawAnimation = () => {
    const YOffset = canvas.height * 0.5 - (Date.now() - game.controls.animationStart)
    ctx.fillStyle = YOffset > 0 ? '#2980b9' : 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (YOffset > -100) {
        const XOffset = 100
        let lastWidth = XOffset
        
        for (let index = 0; index < game.sprites.ships.ships.length; index++) {
            const { sx, sy, swidth, sheight } = game.sprites.ships.ships[index]
            lastWidth += (game.sprites.ships.ships[index - 1]?.swidth || 0) / 2 + 50
            
            ctx.drawImage(game.sprites.ships.img, sx, sy, swidth, sheight, lastWidth, YOffset, swidth / 2, sheight / 2);
        }
    } else {
        for (let index = 0; index < Math.abs(Math.floor(YOffset / 10)); index++) {
            const { x, y } = generatePseudoRandomPosition(index)
            ctx.beginPath();
            ctx.arc(x * 20, y * 10, index % 10 == 0 ? 2 : 1, 0, 2 * Math.PI);
            ctx.fillStyle = "white";
            ctx.fill();
        }

        if (Math.abs(Math.floor(YOffset / 10)) >= 200) {
            game.stage = stageEnum.GAME
        }
    }

}

const drawGame = () => {
    const width = canvas.width
    const height = canvas.height

    const {img, ships} = game.sprites.ships

    // draw background
    for (let index = 0; index < 200; index++) {
        const { x, y } = generatePseudoRandomPosition(index)
        ctx.beginPath();
        ctx.arc(x * 20, y * 10, index % 10 == 0 ? 2 : 1, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }
    
    // draw effects
    game.shots.forEach(e => {
        ctx.beginPath();
        ctx.fillStyle = e.fromPlayer ? 'gold' : 'red';
        ctx.arc(e.position.x, e.position.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // draw airplanes
    [game.player, ...game.enemies].forEach(e => {
        const {x, y, r, ship} = e.position
        const {sx, sy, swidth, sheight} = ships[ship]

        ctx.save();
        ctx.translate(x + swidth / 2, y + sheight / 2);
        ctx.rotate(r % 360 * Math.PI / 180);
        ctx.drawImage(img, sx, sy, swidth, sheight, -swidth / 4, -sheight / 4, swidth / 2, sheight / 2);
        ctx.restore();
    });

    // texts
    ctx.font = "20px " + fontFamily;
    ctx.fillStyle = 'green';
    ctx.fillText(`Total de inimigos: ${game.enemies.length}`, 15, 25);
    ctx.fillText(`HP: ${game.player.hp}`, 15, 45);
}

document.addEventListener("keyup", function(event) {
    const key = event.key.toLowerCase();

    if (game.stage === stageEnum.GAME) {
        if (key === " ") {
            game.controls.keySpace = false
        }

        if (key === "w") {
            game.controls.keyW = false
        }

        if (key === "a") {
            game.controls.keyA = false
        }
        
        if (key === "d") {
            game.controls.keyD = false
        }
    }
});

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (game.stage === stageEnum.MENU) {
        if (key === "arrowright") {
            game.controls.selectIndex++
        }
        
        if (key === "arrowleft") {
            game.controls.selectIndex--
        }

        if (game.controls.selectIndex < 0) {
            game.controls.selectIndex = game.sprites.ships.ships.length -1
        }

        if (game.controls.selectIndex > game.sprites.ships.ships.length -1) {
            game.controls.selectIndex = 0
        }

        if (key === " " || key === "enter") {
            startConfig()
            game.stage = stageEnum.ANIMATION
            game.controls.animationStart = Date.now()
            game.player.position.ship = game.controls.selectIndex
        }
    } else if (game.stage === stageEnum.GAME) {
        if (key === " ") {
            game.controls.keySpace = true
        }
        
        if (key === "w") {
            game.controls.keyW = true
        }
        
        if (key === "a") {
            game.controls.keyA = true
        }
        
        if (key === "d") {
            game.controls.keyD = true
        }
    }  else if (game.stage === stageEnum.LOSE || game.stage === stageEnum.WIN) {
        game.stage = stageEnum.MENU
    }
});

// HELPER FUNCTIONS

function calcDistance(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function generatePseudoRandomPosition(numeroEntrada) {
    const seed = "seed" + numeroEntrada;
    const geradorAleatorio = new Math.seedrandom(seed);
    const x = Math.floor(geradorAleatorio() * 101);
    const y = Math.floor(geradorAleatorio() * 101);
    return { x, y };
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startConfig() {
    game.player = {
        hp: 100,
        damage: 35,
        speed: 2,
        active: false,
        lastShot: 0,
        position: {
            x: 0, y: 0, r: 0, ship: 0
        }
    }

    game.enemies = new Array(5).fill({
        hp: 100,
        damage: 15,
        speed: 2,
        active: false,
    }).map((e) => ({...e, 
        position: {
            x: getRandomNumber(0, window.innerWidth),
            y: getRandomNumber(0, window.innerHeight),
            r: 0,
            ship: getRandomNumber(1, 11),
        },
        targetPosition: {
            x: getRandomNumber(0, window.innerWidth),
            y: getRandomNumber(0, window.innerHeight),
        }
    }))

    game.shots = []

    game.controls.keySpace = false
    game.controls.keyW = false
    game.controls.keyA = false
    game.controls.keyD = false
}
