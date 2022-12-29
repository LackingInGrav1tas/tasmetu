import fs from "fs"

let dataPath = "../data/"

main()
async function main()
{
    // Sort files based on date
    let files = (await fs.promises.readdir(dataPath))
        .filter(name => name.endsWith(".wav"))
        .map(name => [name, fs.statSync(dataPath + name).mtime.getTime()] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .map(file => file[0])

    for (let name of files)
    {
        let data = await fs.promises.readFile(dataPath + name)
        let transcription = "[no transcription]"
        try
        {
            transcription = await fs.promises.readFile(dataPath + name.slice(0, -4) + ".txt", "utf-8")
        }
        catch (e) { }

        renderBufferData(data, name + ": " + transcription)
    }
}

async function renderBufferData(data: Buffer, transcription: string)
{
    // Create canvas element
    let canvas = document.createElement("canvas")
    let c = canvas.getContext("2d")!

    canvas.width = window.innerWidth
    canvas.height = 200

    document.body.appendChild(canvas)

    // Show transcription
    let p = document.createElement("p")
    document.body.appendChild(p)

    p.innerText = transcription

    // Playback element
    let audio = document.createElement("audio")
    document.body.appendChild(audio)

    // decodeAudioBuffer() destroys the data, so have to copy to blob earlier
    let buffer = toArrayBuffer(data)
    let blob = new Blob([buffer], { type: "audio/wav" })

    audio.src = window.URL.createObjectURL(blob)
    audio.controls = true

    let processed = await processAudioData(buffer, canvas.width * 2)

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

function toArrayBuffer(buffer: Buffer): ArrayBuffer
{
    // Convert node buffer to js buffer
    let arrayBuffer = new ArrayBuffer(buffer.length)

    let view = new Uint8Array(arrayBuffer)
    for (let i = 0; i < buffer.length; i++) view[i] = buffer[i]

    return arrayBuffer
}

async function processAudioData(buffer: ArrayBuffer, samples: number): Promise<[number, number][]>
{
    // Decode audio data
    let context = new AudioContext()

    let audioBuffer = await context.decodeAudioData(buffer)
    let channel = audioBuffer.getChannelData(0)

    // Sample min and max
    let processed: [number, number][] = []
    let sampleWidth = Math.floor(channel.length / samples)

    if (sampleWidth <= 0) sampleWidth = 1
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
