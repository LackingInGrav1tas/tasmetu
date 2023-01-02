import fs from "fs"
import FuzzySearch from "fuzzy-search"
import { DATA_PATH } from "./env"

main()
async function main()
{
    let filter = document.querySelector("#filter") as HTMLFormElement
    filter.addEventListener("submit", onSubmitFilter)

    let search = document.querySelector("#search") as HTMLFormElement
    search.addEventListener("submit", onSubmitSearch)

    let dates = Object.entries((await fs.promises.readdir(DATA_PATH))
        .filter(name => name.endsWith(".wav"))
        .map(name => Date.parse(name.split(" ")[0] + "T00:00:00"))
        .reduce((acc, date) => (acc[date] ? acc[date]++ : acc[date] = 1, acc), {} as { [key: number]: number }))
        .map(([date, count]) => [new Date(parseInt(date)), count] as [Date, number])
        .sort((a, b) => b[0].getTime() - a[0].getTime())

    for (let [date, count] of dates)
    {
        let p = document.createElement("p")
        document.body.appendChild(p)

        p.innerText = date.toDateString() + ": " + count + " recording(s)"
    }
}

function onSubmitFilter(e: Event)
{
    e.preventDefault()

    let start = document.querySelector("#start") as HTMLInputElement
    let end = document.querySelector("#end") as HTMLInputElement

    let params = new URLSearchParams()
    if (start.valueAsDate) params.append("start", toLocalDate(start.valueAsDate).getTime().toString())
    if (end.valueAsDate)
    {
        let date = toLocalDate(end.valueAsDate)
        date.setDate(date.getDate() + 1)

        params.append("end", date.getTime().toString())
    }

    window.location.href = "./index.html?" + params
}

let data: { name: string, transcript: string }[] | null = null
async function onSubmitSearch(e: Event)
{
    e.preventDefault()

    let query = document.querySelector("#query") as HTMLInputElement
    let results = document.querySelector("#search-results") as HTMLDivElement

    if (!data)
    {
        let loading = document.createElement("p")
        loading.innerText = "Loading..."
        results.replaceChildren(loading)

        data = (await Promise.all((await fs.promises.readdir(DATA_PATH))
            .filter(name => name.endsWith(".txt"))
            .map(async name =>
            {
                let transcript = await fs.promises.readFile(DATA_PATH + name, "utf-8")
                return { name: name.slice(0, -4), transcript }
            })))
            .filter(file => file.transcript !== "[unrecognized]")
    }

    // Perform search
    let search = new FuzzySearch(data, ["transcript"], { sort: true })
    let result = search.search(query.value)
        .map(({ name, transcript } ) =>
        {
            let p = document.createElement("p")
            p.innerText = name + ": " + transcript

            return p
        })
    
    results.replaceChildren(...result)
}

function toLocalDate(date: Date): Date
{
    date = new Date(date.toLocaleDateString())
    date.setDate(date.getDate() + 1)

    return date
}
