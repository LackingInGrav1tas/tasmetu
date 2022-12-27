import fs from "fs"

let canvas = document.querySelector("#canvas") as HTMLCanvasElement
let c = canvas.getContext("2d")!

fs.readFile("../data/2022-12-27 12.28.11.583409.wav", async (err, data) =>
{
    if (err) throw err

    let buffer = new ArrayBuffer(data.length)

    let view = new Uint8Array(buffer)
    for (let i = 0; i < data.length; i++) view[i] = data[i]

    let context = new AudioContext()
    let audioBuffer = await context.decodeAudioData(buffer)

    let channel = audioBuffer.getChannelData(0)
    let processed = []

    let sampleWidth = Math.floor(channel.length / canvas.width / 2)
    for (let n = 0; n < channel.length; n += sampleWidth)
    {
        let min = Infinity, max = -Infinity
        for (let i = 0; i < sampleWidth; i++)
        {
            let value = channel[n + i]
            
            if (value < min) min = value
            if (value > max) max = value
        }

        processed.push([min, max])
    }

    console.log(processed)

    c.beginPath()
    let scale = 2

    for (let i = 0; i < processed.length; i++)
    {
        let max = processed[i][1]
        let amplitude = max * canvas.height * scale

        c.lineTo(i / processed.length * canvas.width, canvas.height / 2 + amplitude)
    }

    for (let i = processed.length - 1; i >= 0; i--)
    {
        let min = processed[i][0]
        let amplitude = min * canvas.height * scale

        c.lineTo(i / processed.length * canvas.width, canvas.height / 2 + amplitude)
    }
    
    c.closePath()

    c.fillStyle = "#303030"
    c.fill()
})
