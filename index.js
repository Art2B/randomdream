const fs = require("fs")
const Canvas = require('canvas')
const Q = require('q')

const length = 2
const height = 2
const nbColor = 5

const beginIndex = 1512095

function padString (string, pad) {
  let formattedString = string
  while (formattedString.length < pad) {
    formattedString = '0' + formattedString
  }
  return formattedString
}

function positiveOrZero (number) {
  return (number >= 0) ? number : 0 
}

function getColor (indexColor) {
  let nbColorNoBlackNoWhite = nbColor - 2

  if (indexColor === 0) {
    return '#000000'
  }
  if (indexColor === (nbColor - 1)) {
    return '#ffffff'
  }

  let gap = (256 / (nbColorNoBlackNoWhite / 3)) - 1

  let redGap
  if (nbColorNoBlackNoWhite >= 3) {
    redGap = gap
  } else if ( nbColorNoBlackNoWhite === 1) {
    redGap = 256
  } else {
    redGap = 0
  }

  let greenGap
  if (nbColorNoBlackNoWhite >= 3) {
    greenGap = gap
  } else if (nbColorNoBlackNoWhite === 2) {
    greenGap = 255
  } else {
    greenGap = 0
  }

  let blueGap
  if (nbColorNoBlackNoWhite >= 3) {
    blueGap = gap
  } else {
    blueGap = 0
  }

  let red = padString((positiveOrZero((Math.floor(indexColor / 3) - 1)) + ((indexColor % 3 === 1) ? 1 : 0) * gap).toString(16), 2)
  let green = padString((positiveOrZero((Math.floor(indexColor / 3) - 1)) + ((indexColor % 3 === 2) ? 1 : 0) * gap).toString(16), 2)
  let blue = padString((positiveOrZero((Math.floor(indexColor / 3) - 1)) + ((indexColor % 3 === 0) ? 1 : 0) * gap).toString(16), 2)

  return '#' + red + green + blue
}

function loop (promise, fn) {
  return promise.then(fn).then(function (wrapper) {
    if (!wrapper.done) { 
      return loop(imagePromise(wrapper.value), fn)
    }
    return
  })
}

function imagePromise (outcome) {
  return new Promise((resolve) => {  
    let canvas = new Canvas(30 * length, 30 * height)
    let ctx = canvas.getContext("2d")

    for (let i = 0; i < cases.length; i++) {
      if ((cases[i] + 1) < nbColor) {
        cases[i]++
        break
      }
      cases[i] = 0
    }

    for (let i = 0; i < cases.length; i++) {
      let color
      ctx.fillStyle = getColor(cases[i])
      ctx.fillRect((i%height) * 30, Math.floor(i/length) * 30, 30, 30)
    }

    let out = fs.createWriteStream('images/' + outcome + '.png')
    let stream = canvas.pngStream()

    stream.on('data', function(chunk){
      out.write(chunk)
    })

    stream.on('end', function(){
      console.log('saved png: ' + outcome)
      resolve(outcome)
    })
  })
}


fs.mkdirSync('images')

let cases = []
for (let w = 0; w < length*height; w++) {
  cases.push(0)
}

loop(imagePromise(0), (i) => {
  let newVal = i + 1
  return {
    done: (newVal >= Math.pow(nbColor, length*height)) ? true : false,
    value: newVal
  }
}).then(() => {
  console.log('done generating')
})