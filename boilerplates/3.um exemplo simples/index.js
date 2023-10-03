
let canvas, ctx

const fontFamily = "'Pixelify Sans'"

const game = {
    stage: 0,
    world: {
        gravity: 4
    },
    player: {
        hp: 100,
        shotDamage: 35,
        speed: 5,
        cureRate: 1,
        maxHP: 100,
        position: {
            x: 0, y: 0, direction: 'left'
        }
    },
    enemies: new Array(1e2).fill({
        hp: 100,
        attackDistance: 50,
        damage: 1,
        speed: 1,
    }).map((e) => ({...e, 
        position: {
            x: getRandomNumber(5e2, 5e3), y: 0
        }
    })),
    objects: new Array(1e2).fill({}).map((e) => ({...e, 
        position: {
            x: getRandomNumber(1e3, 1e4)
        }
    })),
    shots: []
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = () => {
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    startGame()
}

const startGame = () => {
    update()
    render()

    window.requestAnimationFrame(startGame)
}

const update = () => {
    if (game.stage !== 1) {
        return
    }

    if (game.enemies.length === 0) {
        game.stage = 3
        return 
    }

    if (game.player.hp <= 0) {
        game.stage = 2
        return
    }

    const time = Date.now()

    game.shots = game.shots.filter(e => e.time + 5e2 > time && e.destroyed === false).map(shot => {
        const shotSpeed = 100

        if (shot.direction === 'left') {
            shot.x += shotSpeed
        } else if (shot.direction === 'right') {
            shot.x -= shotSpeed
        } else {
            shot.y -= shotSpeed
        }

        return shot
    })

    game.enemies = game.enemies.map(enemy => {
        if (enemy.position.x > game.player.position.x) {
            enemy.position.x -= enemy.speed
        } else if (enemy.position.x < game.player.position.x) {
            enemy.position.x += enemy.speed
        }
        
        const recoil = 100
        const shotReached = game.shots.find(shot => shot.x > enemy.position.x - recoil && shot.x < enemy.position.x + recoil)
        if (shotReached) {
            shotReached.destroyed = true
            enemy.hp -= shotReached ? game.player.shotDamage : 0
        }

        if (game.player.position.x > enemy.position.x - enemy.attackDistance && game.player.position.x < enemy.position.x + enemy.attackDistance) {
            game.player.hp -= enemy.damage
        }

        return enemy
    }).filter(e => e.hp > 0)

}

const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    switch (game.stage) {
        case 0:
            drawStaticScene("Precione 'start' para começar!", '#2980b9', '#3498db')
            break;
        case 1:
            drawGame()
            break;
        case 2:
            drawStaticScene("Você perdeu!", '#2c3e50', '#34495e')
            break;
        case 3:
            drawStaticScene("Você Venceu!", '#27ae60', '#2ecc71')
            break;
    }
}

const drawStaticScene = (title, bgColor, txtColor) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if ((new Date).getSeconds() % 2 == 0) {
        ctx.font = "90px " + fontFamily;
        ctx.fillStyle = txtColor;
        ctx.fillText(title, 100, 250);
    }
}

const drawGame = () => {

    const width = canvas.width
    const height = canvas.height

    // draw floor
    ctx.fillStyle = "#27ae60";
    ctx.fillRect(0, height * 0.8, width, height * 0.2);

    // draw sky
    ctx.beginPath();
    ctx.arc(95, 50, 40, 0, 2 * Math.PI);
    ctx.fillStyle = "#f1c40f";
    ctx.fill();

    // draw objects in scene
    game.objects.forEach(e => {
        ctx.fillStyle = "#ddd";
        ctx.fillRect(e.position.x, height * 0.425, 400, 400);
    });

    // draw MOB in scene
    const YOffSet = height * 0.7
    
    ctx.fillStyle = "blue";
    game.enemies.forEach(e => {
        ctx.fillRect(e.position.x, YOffSet - e.position.y, 50, 150);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(game.player.position.x, YOffSet - game.player.position.y, 75, 150);
    
    // draw effects
    ctx.fillStyle = "gold";
    game.shots.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, YOffSet - e.y + 10, 5, 0, 2 * Math.PI);
        ctx.fill();
    });

    // texts
    ctx.font = "20px " + fontFamily;
    ctx.fillStyle = 'green';
    ctx.fillText(`Total de inimigos: ${game.enemies.length}`, width * 0.85, 25);
    ctx.fillText(`HP: ${game.player.hp}`, width * 0.85, 45);
}

window.onclick = () => {
    if (game.stage === 0) {
        game.stage++;
    }    
}

document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (key === " ") {
        game.shots.push({
            time: Date.now(),
            destroyed: false,
            x: game.player.position.x,
            y: game.player.position.y,
            direction: game.player.position.direction
        })
    }

    if (key === "a") {
        game.player.position.x -= game.player.speed;
        game.player.position.direction = 'right'
    }
    
    if (key === "d") {
        game.player.position.x += game.player.speed;
        game.player.position.direction = 'left'
    }
});