import fs from "fs"

const DATA_PATH = "../data/"
const RENDER_HEIGHT = 200

const OFFSET = 0.25

main()
async function main()
{
    // Sort files based on date
    let files = (await fs.promises.readdir(DATA_PATH))
        .filter(name => name.endsWith(".wav"))
        .map(name => [name, fs.statSync(DATA_PATH + name).mtime.getTime()] as [string, number])
        .sort((a, b) => b[1] - a[1])
        .map(file => file[0])

    for (let name of files)
    {
        let data = await fs.promises.readFile(DATA_PATH + name)
        let transcription = "[no transcription]"
        try
        {
            transcription = await fs.promises.readFile(DATA_PATH + name.slice(0, -4) + ".txt", "utf-8")
        }
        catch (e) { }

        renderBufferData(data, name + "\n" + transcription)
    }
}

async function renderBufferData(data: Buffer, transcription: string)
{
    // Create canvas element
    let canvas = document.createElement("canvas")
    let c = canvas.getContext("2d")!
    document.body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = RENDER_HEIGHT + 1 // Looks better when odd for some reason

    let div = document.createElement("div")
    document.body.appendChild(div)

    // Show transcription
    let p = document.createElement("p")
    div.appendChild(p)

    p.innerText = transcription

    // Playback element
    let audio = document.createElement("audio")
    div.appendChild(audio)

    // decodeAudioBuffer() destroys the data, so have to copy to blob earlier
    let buffer = toArrayBuffer(data)
    let blob = new Blob([buffer], { type: "audio/wav" })

    audio.src = window.URL.createObjectURL(blob)
    audio.controls = true

    let decoded = await decodeAudioData(buffer)
    let processed = sampleData(decoded, canvas.width * 2)

    let max = -Infinity
    for (let [sampleMin, sampleMax] of processed)
    {
        let maxDisplacement = Math.max(Math.abs(sampleMin), Math.abs(sampleMax))
        if (maxDisplacement > max) max = maxDisplacement
    }

    // Draw shape
    c.beginPath()
    let scale = canvas.height / 2 / max

    for (let i = 0; i < processed.length; i++)
    {
        let amplitude = processed[i][1] * scale
        c.lineTo(i / processed.length * canvas.width, canvas.height / 2 + amplitude + OFFSET)
    }

    for (let i = processed.length - 1; i >= 0; i--) // This is in reverse so it can be done in one fill
    {
        let amplitude = processed[i][0] * scale
        c.lineTo(i / processed.length * canvas.width, canvas.height / 2 + amplitude - OFFSET)
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

async function decodeAudioData(buffer: ArrayBuffer): Promise<Float32Array>
{
    // Decode audio data
    let context = new AudioContext()
    let audioBuffer = await context.decodeAudioData(buffer)
    
    return audioBuffer.getChannelData(0)
}

function sampleData(data: Float32Array, samples: number): [number, number][]
{
    // Sample min and max
    let processed: [number, number][] = []
    let sampleWidth = Math.floor(data.length / samples)

    if (sampleWidth <= 0) sampleWidth = 1
    for (let n = 0; n < data.length; n += sampleWidth)
    {
        let min = Infinity, max = -Infinity
        for (let i = 0; i < sampleWidth; i++)
        {
            let value = data[n + i]
            
            if (value < min) min = value
            if (value > max) max = value
        }

        processed.push([min, max])
    }

    return processed
}
