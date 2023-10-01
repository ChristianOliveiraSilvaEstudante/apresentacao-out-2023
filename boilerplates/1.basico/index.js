
let canvas, ctx

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
}