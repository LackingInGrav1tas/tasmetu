import fs from "fs"

let dataPath = "../data/"

main()
async function main()
{
    // Sort files based on date
    let files = await fs.promises.readdir(dataPath)
    files = files
        .map(name => [name, fs.statSync(dataPath + name).mtime.getTime()] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .map(file => file[0])

    let soundFiles = files.filter(name => name.endsWith(".wav"))
    for (let name of soundFiles)
    {
        let data = await fs.promises.readFile(dataPath + name)
        let transcription = "[no transcription]"
        try
        {
            transcription = await fs.promises.readFile(dataPath + name.slice(0, -4) + ".txt", "utf-8")
        }
        catch (e) { }

        renderBufferData(data)

        let p = document.createElement("p")
        document.body.appendChild(p)

        p.innerText = transcription
    }
}

async function renderBufferData(data: Buffer)
{
    // Create canvas element
    let canvas = document.createElement("canvas")
    let c = canvas.getContext("2d")!

    canvas.width = 1000
    canvas.height = 200

    document.body.appendChild(canvas)

    let processed = await processAudioData(data, canvas.width * 1.5)

    // Draw shape
    c.beginPath()
    let scale = 2

    for (let i = 0; i < processed.length; i++)
    {
        let max = processed[i][1]
        let amplitude = max * canvas.height * scale

        c.lineTo(i / processed.length * canvas.width, canvas.height / 2 + amplitude)
    }

    for (let i = processed.length - 1; i >= 0; i--) // This is in reverse so it can be done in one fill
    {
        let min = processed[i][0]
        let amplitude = min * canvas.height * scale

        c.lineTo(i / processed.length * canvas.width, canvas.height / 2 + amplitude)
    }
    
    c.closePath()

    c.fillStyle = "#303030"
    c.fill()
}

async function processAudioData(data: Buffer, samples: number)
{
    // Convert node buffer to js buffer
    let buffer = new ArrayBuffer(data.length)

    let view = new Uint8Array(buffer)
    for (let i = 0; i < data.length; i++) view[i] = data[i]

    // Decode audio data
    let context = new AudioContext()

    let audioBuffer = await context.decodeAudioData(buffer)
    let channel = audioBuffer.getChannelData(0)

    // Sample min and max
    let processed: [number, number][] = []
    let sampleWidth = Math.floor(channel.length / samples)

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

    return processed
}
