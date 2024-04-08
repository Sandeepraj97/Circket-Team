const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running in at http://localhost/3000')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initialiseDBAndServer()

const convertDBobjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
//get list of player API1

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT *
    FROM
    cricket_team;`
  const playerArray = await db.all(getPlayerQuery)
  response.send(
    playerArray.map(eachPlayer => convertDBobjectToResponseObject(eachPlayer)),
  )
})

// create new player API2

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES(
      ${playerName},
      ${jerseyNumber},
      ${role}
    );`
  const dbResponse = await db.run(addPlayerQuery)
  const playerId = dbResponse.lastID
  response.send('Player Added to Team')
})

// GETTING PLYER BY ID API3

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = requesr.params
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDBobjectToResponseObject(player))
})

// UPDATE PLYER API4

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQurey = `
    UPDATE cricket_team
    SET 
      player_name : ${playerName},
      jersey_number : ${jerseyNumber},
      role : ${role}
      WHERE player_id  = ${playerId};`
  await db.run(updatePlayerQurey)
  response.send('Player Details Found')
})

// delete book API

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM cricket_team
  WHERE player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
