let lastRenderTime = 0
const GRID_SIZE = 21
const SNAKE_SPEED = 4 //velocidade snake
const snakeBody = [{ x: 11, y: 11 }] //posição inicial snake
let newSegments = 0 //corpo snake crescendo

let food = getRandomFoodPosition() //posição food aleatoria
const EXPANSION_RATE = 1

let inputDirection = { x: 0, y: 0 } //direção snake
let lastInputDirection = { x: 0, y: 0 } //direção snake

const gameBoard = document.querySelector('#game-board')

let gameOver = false

let scoreDisplay = document.querySelector('#score')
let score = 0

let buttonResponsive = document.querySelectorAll('button')

const hitSound = new Audio('./sound/hit.mp3')
const errorSound = new Audio('./sound/error.mp3')

buttonResponsive.forEach(button => {
    button.addEventListener('click', function(){responsiveMovement(button.id)})
})

function responsiveMovement(id) {
    switch(id) {
        case "ArrowUp":
            if(lastInputDirection.y !== 0) break
            inputDirection = { x:0, y: -1 }
            break
        case "ArrowDown":
            if(lastInputDirection.y !== 0) break
            inputDirection = { x:0, y: 1 }
            break
        case "ArrowLeft":
            if(lastInputDirection.x !== 0) break
            inputDirection = { x:-1, y: 0 }
            break
        case "ArrowRight":
            if(lastInputDirection.x !== 0) break
            inputDirection = { x:1, y: 0 }
            break
    }
    
}

function main(currentTime) { //controla a velocidade do jogo. 2 vezes por segundo

    if(gameOver) {
        if(confirm('Você perdeu. Pressione OK para começar de novo!')){
            document.location.reload()    
        }
        return
    } 

    window.requestAnimationFrame(main)

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
    
    if(secondsSinceLastRender < 1 / SNAKE_SPEED) return

    lastRenderTime = currentTime

    updateSnake()
    drawSnake(gameBoard)

    updateFood()
    drawFood(gameBoard)

    checkDeath()
}

window.requestAnimationFrame(main)

function updateSnake() {
    addSegments() //adiciona corpo a snake

    lastInputDirection = inputDirection

    for(let i = snakeBody.length - 2; i >=0; i--){
        snakeBody[i + 1] = { ...snakeBody[i] }
    }

    snakeBody[0].x += inputDirection.x
    snakeBody[0].y += inputDirection.y
}

function drawSnake(gameBoard){
    gameBoard.innerHTML = ""

    snakeBody.forEach(segment => {
        const snakeElement = document.createElement('div')
        snakeElement.style.gridRowStart = segment.y
        snakeElement.style.gridColumnStart = segment.x
        snakeElement.classList.add('snake')
        gameBoard.appendChild(snakeElement)
    })
}

function expandSnake(amount) {
    newSegments += amount //aumentar tamanho snake quando comer food
}

function onSnake(position, { ignoreHead = false } = {}) { //return true se snake está sobre food
    return snakeBody.some( (segment, index) => {
        if(ignoreHead && index === 0) return false
        return equalPosition(segment, position)
    })
}

function equalPosition(pos1, pos2){ //verificando se snake comeu food
    //se estão na mesma posição
    return pos1.x === pos2.x && pos1.y === pos2.y
}

function addSegments() {
    for (let i = 0; i < newSegments; i++) {
        snakeBody.push({ ...snakeBody[snakeBody.length - 1] }) //adiciona um corpo ao final snake
        addScore()
    }
    newSegments = 0 //só adiciona um corpo a snake
}

function addScore(){
    hitSound.play()
    score++
    scoreDisplay.innerHTML = score
    if(score % 10 == 0){
        SNAKE_SPEED++
    }
}

window.addEventListener('keydown', moveSnake)

function moveSnake(e) {
    switch(e.key) {
        case "ArrowUp":
            if(lastInputDirection.y !== 0) break
            inputDirection = { x:0, y: -1 }
            break
        case "ArrowDown":
            if(lastInputDirection.y !== 0) break
            inputDirection = { x:0, y: 1 }
            break
        case "ArrowLeft":
            if(lastInputDirection.x !== 0) break
            inputDirection = { x:-1, y: 0 }
            break
        case "ArrowRight":
            if(lastInputDirection.x !== 0) break
            inputDirection = { x:1, y: 0 }
            break
    }
}

function updateFood(){
    if(onSnake(food)){
        expandSnake(EXPANSION_RATE)
        food = getRandomFoodPosition() //nova posição food
    }
}

function drawFood(){
    const foodElement = document.createElement('div')
    foodElement.style.gridRowStart = food.y
    foodElement.style.gridColumnStart = food.x
    foodElement.classList.add('food')
    gameBoard.appendChild(foodElement) 
}

function getRandomFoodPosition() { //posição aleatoria food no tabuleiro
    let newFoodPosition
    while(newFoodPosition == null || onSnake(newFoodPosition)) {
        newFoodPosition = randomGridPosition() 
    }
    return newFoodPosition
}

function randomGridPosition() {
    const GRID_SIZE = 21 //tamanho do tabuleiro (grid)
    return {
        x: Math.floor(Math.random() * GRID_SIZE) + 1,
        y: Math.floor(Math.random() * GRID_SIZE) + 1
    }
}

function checkDeath(){
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection()
    if(gameOver) errorSound.play()
}

function outsideGrid(position) {
    //verifica se a cabeça snake está encostando nas bordas do tabuleiro
    return (
        position.x < 1 || position.x > GRID_SIZE - 1 ||
        position.y < 1 || position.y > GRID_SIZE - 1 
    )
}

function getSnakeHead(){
    return snakeBody[0] //posição cabeça snake
}

function snakeIntersection() {
    //se a snake está esbarrando nela mesmom
    return onSnake(snakeBody[0], { ignoreHead: true })
}

function showCoordinates(event) {
    let x = event.touches[0].clientX;
    let y = event.touches[0].clientY;

    let width = window.innerWidth
    let height = window.innerHeight

    if(x > width / 2 && y > (height / 3 * 1) && y < (height / 3 * 2)){ //direita
        if(lastInputDirection.x == 0){
            inputDirection = { x:1, y: 0 }
        }
    }
    if(x < width / 2 && y > (height / 3 * 1) && y < (height / 3 * 2)){ //esquerda
        if(lastInputDirection.x == 0) {
            inputDirection = { x:-1, y: 0 }
        }
    }

    if(y < (height / 3 * 1)) { //cima
        if(lastInputDirection.y == 0) {
            inputDirection = { x:0, y: -1 }
        }
    }
    if(y > (height / 3 * 2)) { //baixo
        if(lastInputDirection.y == 0) {
            inputDirection = { x:0, y: 1 }
        }
    }
}