import fs from "fs"
import { DATA_PATH } from "./env"

const RENDER_HEIGHT = 100
const OFFSET = 0.25

main()
async function main()
{
    // Sort files based on date
    let fileData = (await fs.promises.readdir(DATA_PATH))
        .filter(name => name.endsWith(".wav"))
        .map(name => [name, toJSDate(name.slice(0, -4))] as [string, Date])

    // Filter based on parameters
    let params = new URLSearchParams(window.location.search)
    if (params.get("start"))
        fileData = fileData.filter(([_, date]) => date.getTime() > parseInt(params.get("start")!))
    if (params.get("end"))
        fileData = fileData.filter(([_, date]) => date.getTime() < parseInt(params.get("end")!))

    let renders = await Promise.all(fileData
        .sort((a, b) => b[1].getTime() - a[1].getTime())
        .map(file => file[0])
        .map(async name =>
        {
            let data = fs.promises.readFile(DATA_PATH + name)
            let transcriptPromise = fs.promises.readFile(DATA_PATH + name.slice(0, -4) + ".txt", "utf-8")

            let transcription: string
            try { transcription = await transcriptPromise }
            catch (e) { transcription = "[no transcription]" }
    
            return await renderBufferData(await data, name.slice(0, -4) + "\n" + transcription)
        }))
        
    document.body.removeChild(document.querySelector("#loading") as HTMLParagraphElement)
    for (let render of renders) document.body.appendChild(render)
}

function toJSDate(string: string): Date
{
    let i = string.lastIndexOf(".")
    string = string
        .replace(" ", "T")
        .replaceAll(".", ":")

    return new Date(string.substring(0, i) + "." + string.substring(i + 1))
}

async function renderBufferData(data: Buffer, transcription: string): Promise<HTMLDivElement>
{
    let render = document.createElement("div")

    // Create canvas element
    let canvas = document.createElement("canvas")
    let c = canvas.getContext("2d")!
    render.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = RENDER_HEIGHT + 1 // Looks better when odd for some reason

    let div = document.createElement("div")
    render.appendChild(div)

    div.classList.add("description")

    // Show transcription
    let span = document.createElement("span")
    div.appendChild(span)

    span.innerText = transcription

    // Playback element
    let audio = document.createElement("audio")
    div.appendChild(audio)

    // decodeAudioBuffer() destroys the data, so have to copy to blob earlier
    let buffer = toArrayBuffer(data)
    let blob = new Blob([buffer], { type: "audio/wav" })

    audio.src = window.URL.createObjectURL(blob)
    audio.controls = true

    let decoded = await decodeAudioData(buffer)
    let processed = sampleData(decoded, canvas.width * 1.5)

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

    return render
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
