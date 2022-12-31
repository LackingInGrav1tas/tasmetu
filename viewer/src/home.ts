import fs from "fs"
import { DATA_PATH } from "./env"

main()
async function main()
{
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

    let form = document.querySelector("#filter") as HTMLFormElement
    form.addEventListener("submit", onSubmit)
}

function onSubmit(e: Event)
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

function toLocalDate(date: Date): Date
{
    date = new Date(date.toLocaleDateString())
    date.setDate(date.getDate() + 1)

    return date
}
