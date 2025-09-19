console.log('bro')

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement

canvas.style.height = '648px'
canvas.style.width = '480px'
canvas.style.imageRendering = 'pixelated'

const ctx = canvas!.getContext('2d') as CanvasRenderingContext2D

ctx.fillStyle = 'black'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.font = '24px serif'
ctx.fillStyle = 'white'
ctx.fillText('BroOoOoOoOoOo', 24, 24)

// notes
// border type and color for pre-plays
  // needs to be turned on in menu

const run = async () => {
  const image = new Image()
  image.src = './assets/tiles.png'
  console.log(image)

  // from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
  // await Promise.all(
  //   Array.from(document.images).map(
  //     (image) =>
  //       new Promise((resolve) => image.addEventListener("load", resolve)),
  //   ),
  // );

  image.addEventListener('load', () => {
    ctx.drawImage(image, 0, 192, 12, 12, 5, 5, 12, 12)
  })
}


run()
