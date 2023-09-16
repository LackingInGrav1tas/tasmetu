import fs from "fs"
import { DATA_PATH } from "./env"

const FILES_PER_PAGE = 5

const RENDER_HEIGHT: number = 100
const OFFSET: number = 0.25

const HOUR: number = 60 * 60 * 1000

let files!: [string, Date][]
let pages: HTMLSpanElement[] = []

main()
async function main()
{
    // Calculate min and max times from inputs
    let params = new URLSearchParams(window.location.search)

    let min = parseInt(params.get("date")!) + parseInt(params.get("time")!) * HOUR
    let max = min + HOUR

    let folders = await fs.promises.readdir(DATA_PATH)
    files = (await Promise.all(folders
        .map(async folder => (await fs.promises.readdir(DATA_PATH + folder))
            .filter(name => name.endsWith(".wav"))
            .map(name =>
            [
                folder + "/" + name,
                new Date(folder.split(" ")[0] + "T" + name.slice(0, -11).replaceAll(".", ":"))
            ] as [string, Date])
            .filter(([_, date]) =>
            {
                let time = date.getTime()
                return time >= min && time < max
            }))))
        .reduce((acc, current) => [...acc, ...current])
        .sort((a, b) => a[1].getTime() - b[1].getTime()) // Sort files based on date

    // Generate pagination data
    let pageContainer = document.querySelector("#pages")!
    let count = Math.ceil(files.length / FILES_PER_PAGE)

    for (let i = 0; i < count; i++)
    {
        let span = document.createElement("span")
        span.innerText = (i + 1).toString()

        span.addEventListener("mousedown", () => setActive(i))

        pageContainer.appendChild(span)
        pages.push(span)
    }
    setActive(0)
}

async function setActive(page: number)
{
    for (let page of pages) page.classList.remove("active")
    pages[page].classList.add("active")

    let content = document.querySelector("#content") as HTMLDivElement

    // Let user know the files are being loaded
    let loading = document.createElement("p")
    loading.innerText = "Loading..."
    content.replaceChildren(loading)

    // Render files
    let start = page * FILES_PER_PAGE
    let renders = await Promise.all(files
        .slice(start, start + FILES_PER_PAGE)
        .map(file => file[0])
        .map(async name =>
        {
            let data = fs.promises.readFile(DATA_PATH + name)

            let transcription: string
            try { transcription = await fs.promises.readFile(DATA_PATH + name.slice(0, -4) + ".txt", "utf-8") }
            catch (e) { transcription = "[no transcription]" }

            return await renderBufferData(await data, name.slice(0, -4), transcription)
        }))

    content.replaceChildren(...renders)
}

async function renderBufferData(data: Buffer, name: string, transcription: string):
    Promise<HTMLDivElement | HTMLParagraphElement>
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

    span.innerText = name + "\n" + transcription

    // Playback element
    let audio = document.createElement("audio")
    div.appendChild(audio)

    // decodeAudioBuffer destroys the data, so have to copy to blob earlier
    let buffer = toArrayBuffer(data)
    let blob = new Blob([buffer], { type: "audio/wav" })

    audio.src = window.URL.createObjectURL(blob)
    audio.controls = true

    try
    {
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
    catch
    {
        let error = document.createElement("p")
        error.innerText = "Error loading " + name

        return error
    }
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
