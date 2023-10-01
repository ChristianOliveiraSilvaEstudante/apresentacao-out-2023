
let canvas, ctx

const fontFamily = "'Pixelify Sans'"

const game = {
    stage: 0
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
    
}

const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    switch (game.stage) {
        case 0:
            drawStaticScene("Precione 'start' para começar!", '#2980b9', '#3498db')
            break;
        case 1:
            // aqui pode ser começado o game
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

window.onclick = () => {
    game.stage++

    if (game.stage > 3) {
        game.stage = 0
    }
}