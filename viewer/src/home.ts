import fs from "fs"
import FuzzySearch from "fuzzy-search"
import { DATA_PATH } from "./env"

let date: HTMLInputElement = document.querySelector("#date") as HTMLInputElement
let time: HTMLInputElement = document.querySelector("#time") as HTMLInputElement

main()
async function main()
{
    // Initialize date and time values in input
    date.valueAsDate = new Date()
    time.valueAsNumber = new Date().getHours()

    // Register submission events
    let filter = document.querySelector("#filter") as HTMLFormElement
    filter.addEventListener("submit", onSubmitFilter)

    let search = document.querySelector("#search") as HTMLFormElement
    search.addEventListener("submit", onSubmitSearch)

    // Generate overview data
    let folders = await fs.promises.readdir(DATA_PATH)
    let dates = (await Promise.all(folders
        .map(async folder =>
        {
            // Count number of audio files in the folders for each day
            let files = await fs.promises.readdir(DATA_PATH + folder)
            return [
                new Date(folder.split(" ")[0] + "T00:00:00"),
                files.filter(name => name.endsWith(".wav")).length
            ] as [Date, number]
        })))
        .map(([date, count]) =>
        {
            // Generate HTML elements
            let p = document.createElement("p")
            p.innerText = date.toDateString() + ": " + count + " recording"
            if (count !== 1) p.innerText += "s"
            
            return p
        })

    let overview = document.querySelector("#overview")!
    overview.append(...dates)
}

function onSubmitFilter(e: Event)
{
    // Switch to filter page along with parameters
    e.preventDefault()
    let params = new URLSearchParams()

    let d = new Date(date.valueAsDate!.toLocaleDateString())
    d.setDate(d.getDate() + 1) // For some reason the input gives back the day before, so the day has to be shifted

    params.append("date", d.getTime().toString())
    params.append("time", time.value)

    window.location.href = "./index.html?" + params
}

let search: FuzzySearch<{ name: string, transcript: string }> | null = null
async function onSubmitSearch(e: Event)
{
    e.preventDefault()

    let query = document.querySelector("#query") as HTMLInputElement
    let results = document.querySelector("#search-results") as HTMLDivElement

    if (search === null)
    {
        // Load all transcripts
        let loading = document.createElement("p")
        loading.innerText = "Generating index... "
        results.replaceChildren(loading)

        let folders = await fs.promises.readdir(DATA_PATH)
        let files = (await Promise.all(folders
            .map(async folder => (await fs.promises.readdir(DATA_PATH + folder))
                .filter(name => name.endsWith(".txt"))
                .map(name => folder + "/" + name)
            )))
            .reduce((acc, current) => [...acc, ...current])

        let data = await Promise.all(files.map(async name =>
        {
            let transcript = await fs.promises.readFile(DATA_PATH + name, "utf-8")
            return { name: name.slice(0, -4), transcript }
        }))
        search = new FuzzySearch(data, ["transcript"], { sort: true })
    }

    // Perform search
    let result = search.search(query.value).map(({ name, transcript }) =>
    {
        let p = document.createElement("p")
        p.innerText = name + ": " + transcript

        return p
    })
    results.replaceChildren(...result)
}
