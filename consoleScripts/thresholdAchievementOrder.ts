const fs = require("fs")

const LEAGUES = ["AL", "CL", "FL", "ED/IN", "EDs", "IN"]
const GAMES_PLAYED_FILE =
  "data/Scuffed MiniFTF S1 League - TEMP-games played.csv"
const ROUNDS_NEEDED_FILE =
  "data/Scuffed MiniFTF S1 League - TEMP-rounds needed.csv"
const TIERS_FILE_PREFIX = "data/tiers/Scuffed MiniFTF S1 League - TEMP-tiers"
const THRESHOLD = 0.5 // 50% completion to be counted

interface TierToGamesForThreshold {
  [tier: string]: number
}

interface PlayerToTier {
  [playerName: string]: string
}

interface LeagueToOrderCompleted {
  league: string
  orderCompleted: number
}

// league to tiers to games-for-threshold
const gamesForThreshold: { [league: string]: TierToGamesForThreshold } = {}
// league to player to tier
const playerTiers: { [league: string]: PlayerToTier } = {}
// player-league to amountCompleted. stops counting percentages over 50%.
const playerGameCompletion: { [playerWithLeague: string]: number } = {}
// playerName to league to orderCompleted
const thresholdReachedOrder: { [playerName: string]: LeagueToOrderCompleted } =
  {}

function parseTierThresholds() {
  const tiers: string[] = fs
    .readFileSync(ROUNDS_NEEDED_FILE, "utf8")
    .split("\n")
  tiers.forEach((str) => {
    const [league, tier, num_games] = str.split(",")
    if (!gamesForThreshold[league]) {
      gamesForThreshold[league] = {}
    }
    gamesForThreshold[league][tier] = Number(num_games) * THRESHOLD
  })
}

function parsePlayerToTier() {
  LEAGUES.forEach((league) => {
    const leagueFilename = `${TIERS_FILE_PREFIX} ${league.replace("/", "")}.csv`
    const playerInfo: string[] = fs
      .readFileSync(leagueFilename, "utf8")
      .split("\r\n")
    playerInfo.forEach((str) => {
      const [_, tier, playerName] = str.split(",")
      if (!playerTiers[league]) {
        playerTiers[league] = {}
      }
      playerTiers[league][playerName] = tier
    })
  })
}

function parseGames() {
  const games: string[] = fs
    .readFileSync(GAMES_PLAYED_FILE, "utf8")
    .split("\r\n")
  games.forEach((game) => {
    const [league, p1, p2] = game.split(",")

    try {
      updatePlayerStatusIfNeeded(league, p1)
      updatePlayerStatusIfNeeded(league, p2)
    } catch (e: unknown) {
      console.log(`${league} -- ${e}`)
      throw e
    }
  })
}

function updatePlayerStatusIfNeeded(league: string, playerName: string): void {
  // if player alr reached threshold, skip
  if (Object.keys(thresholdReachedOrder).includes(playerName)) return

  // update completion amount for this player
  const mapKey = `${playerName}-${league}`
  const gamesCompletedForLeague: number =
    (playerGameCompletion[mapKey] || 0) + 1
  playerGameCompletion[mapKey] = gamesCompletedForLeague

  // add to "completed threshold" list if needed
  const playerTierForLeague = playerTiers[league][playerName]
  const numGamesPlayerNeeds = gamesForThreshold[league][playerTierForLeague]
  if (gamesCompletedForLeague > numGamesPlayerNeeds) {
    const orderCompleted = Object.keys(thresholdReachedOrder).length
    thresholdReachedOrder[playerName] = { league, orderCompleted }
  }
}

function main() {
  parseTierThresholds()
  parsePlayerToTier()
  parseGames()

  console.log("==========================================")
  console.log(gamesForThreshold)
  console.log("==========================================")
  console.log(playerTiers)
  console.log("==========================================")
  console.log(playerGameCompletion)
  console.log("==========================================")
  Object.entries(thresholdReachedOrder).map(([playerName, details]) => {
    console.log(
      `#${details.orderCompleted + 1}: ${playerName} (${details.league})`
    )
  })
}

main()
