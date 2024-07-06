// const fs = require("fs")

// const FILE_TO_PARSE = "data/miniFTF S1 Testing Sheet.txt"
// const DEBUG = false

// const TIME_MAP: { [playerAndLeague: string]: number[] } = {}

// enum EntryStatus {
//   WATCHING = 1,
//   COMPLETED = 2,
// }
// enum League {
//   AL = "AL",
//   CL = "CL",
//   FL = "FL",
//   ED = "ED",
//   IN = "IN",
//   EDIN = "ED/IN",
// }

// interface ListState {
//   name: string
//   status: EntryStatus
//   score: number | null
// }

// interface SongObject {
//   songNumber: 1
//   songInfo: Object
//   correctGuess: boolean
//   wrongGuess: boolean
//   answer: string
//   correctCount: number
//   wrongCount: number
//   startPoint: number
//   videoLength: number
//   videoUrl: string
//   correctGuessPlayers: string[]
//   listStates: ListState[]
// }

// interface JsonObject {
//   roomName: string
//   startTime: string // a datetime
//   songs: SongObject[]
// }

// function debug(str: any) {
//   if (DEBUG) {
//     console.log(str)
//   }
// }

// function parseTsv() {
//   // Read file
//   const games: string[] = fs.readFileSync(FILE_TO_PARSE, "utf8").split("\n")
//   games.forEach((game, idx) => {
//     const [league, jsonStr] = game.split("\t")

//     if (jsonStr) {
//       parseGame(league as League, jsonStr, idx)
//     }
//   })
// }

// function parseGame(league: League, jsonStr: string, idx: number) {
//   let json: JsonObject
//   try {
//     json = JSON.parse(jsonStr)
//   } catch (e) {
//     console.log(`Error parsing game at row ${idx + 2}`)
//     debug(e)
//     return
//   }

//   let correctCount = 0
//   let totalCorrectMs = 0
//   let sheetReporter = ""

//   json.songs.forEach(
//     ({ answer, wrongGuess, songNumber, correctGuessPlayers }) => {
//       debug(
//         `song #${songNumber} [${wrongGuess ? "WRONG" : "RIGHT"}]: ${answer}`
//       )

//       // determine sheet reporter
//       if (!sheetReporter && !wrongGuess && correctGuessPlayers?.length === 1) {
//         sheetReporter = correctGuessPlayers[0]
//       }

//       // update ms if correct
//       if (!wrongGuess) {
//         correctCount++
//         const msStr = answer.slice(-9).trim().slice(1, -3)
//         totalCorrectMs += +msStr
//       }
//     }
//   )
//   const avgCorrectMs = totalCorrectMs / correctCount

//   debug(`${sheetReporter} average correct ms: ${avgCorrectMs}`)

//   // update timemap
//   const key = `${sheetReporter} [${league}]`
//   if (!TIME_MAP[key]) {
//     TIME_MAP[key] = [avgCorrectMs]
//   } else {
//     TIME_MAP[key].push(avgCorrectMs)
//   }
// }

// parseTsv()
// const flattened = Object.entries(TIME_MAP)
//   .sort()
//   .forEach(([playerAndLeague, times]) => {
//     const numDataPts = times.length
//     const overallAvg: number = Math.round(
//       times.reduce((curr, total) => total + curr, 0) / numDataPts
//     )

//     if (Number.isNaN(overallAvg)) {
//       return
//       // const overallAvgStr = Number.isNaN(overallAvg) ? "-" : `${overallAvg}ms`;
//     }

//     const space = `${numDataPts > 9 ? "" : " "}`
//     const gameInfoStr =
//       ` ${overallAvg}ms ${space}(${numDataPts} games)`.padStart(20, ".")
//     const playerInfoStr = playerAndLeague.padEnd(25, ".")
//     console.log(playerInfoStr + gameInfoStr)
//   })
