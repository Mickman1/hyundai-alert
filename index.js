import fetch from 'node-fetch'
import { Client, Intents } from 'discord.js'
const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const config = require('./config.json') 

client.on('ready', async () => {
	let user = await client.users.fetch(config.userId)

	let url = 'https://www.hyundaiusa.com/var/hyundai/services/inventory/vehicleList.json?zip=33714&year=2022&model=IONIQ5&radius=1'
	let settings = { method: 'Get', headers: { 'referer': 'https://www.hyundaiusa.com/us/en/vehicles' } }

	let exteriorColorMap = new Map()
	exteriorColorMap.set('MZH', 'Phantom Black')
	exteriorColorMap.set('M9U', 'Digital Teal')
	exteriorColorMap.set('C5G', 'Cyber Gray')
	exteriorColorMap.set('SAW', 'Atlas White')
	exteriorColorMap.set('U3P', 'Lucid Blue')
	exteriorColorMap.set('T5R', 'Shooting Star')

	let interiorColorMap = new Map()
	interiorColorMap.set('YGN', 'Gray')
	interiorColorMap.set('NNB', 'Black')

	setInterval(function() {
		fetch(url, settings).then(res => res.json()).then((json) => {
			// Loop through all dealerships in radius
			for (let d = 0; d < json.data[0].dealerInfo.length; d++) {
				// If dealer has no vehicles listed, skip
				if (json.data[0].dealerInfo[d].vehicles === null) {
					continue
				}

				// Loop through all available vehicles at dealership
				for (let i = 0; i < json.data[0].dealerInfo[d].vehicles.length; i++) {
					var data = json.data[0].dealerInfo[d].vehicles[i]

					if (data.trimDesc !== 'SE') {
						continue
					}

					if (data.drivetrainDesc !== 'REAR WHEEL DRIVE') {
						continue
					}

					if (data.exteriorColorCd === 'MZH') {
						continue
					}

					if (data.PlannedDeliveryDate !== null) {
						user.send(`**ALERT!** \`${exteriorColorMap.get(data.exteriorColorCd)}\` with \`${interiorColorMap.get(data.interiorColorCd)}\` interior arriving on \`${data.PlannedDeliveryDate.substring(5, 10).replaceAll('-', '/') + '/' + data.PlannedDeliveryDate.substring(0, 4)}\``)
						console.log(`ALERT! ${exteriorColorMap.get(data.exteriorColorCd)} with ${interiorColorMap.get(data.interiorColorCd)} interior arriving on ${data.PlannedDeliveryDate.substring(5, 10).replaceAll('-', '/') + '/' + data.PlannedDeliveryDate.substring(0, 4)}`)
					}

					else {
						console.log(`ALERT! ${exteriorColorMap.get(data.exteriorColorCd)} with ${interiorColorMap.get(data.interiorColorCd)} interior with no planned delivery`)
						user.send(`**ALERT!** \`${exteriorColorMap.get(data.exteriorColorCd)}\` with \`${interiorColorMap.get(data.interiorColorCd)}\` interior with no planned delivery`)
					}
				}
			}
		})
	}, 600000)
})

client.login(config.token)