import { request } from 'node:https';

async function searchYahoo(query) {
	return new Promise((resolve, reject) => {
		const url = new URL(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`)
		const req = request(url, {
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'text/html,application/xhtml+xml,application/xml'
}
}, (res) => {
			let html = ''
			res.on('data', d => html += d)
			res.on('end', () => {
				const results = []
                // regex for yahoo search results:
                const resultRegex = /<h3 class="title">[^<]*<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>.*?<div class="compText aAbs"[^>]*>([\s\S]*?)<\/div>/gis
let match
while ((match = resultRegex.exec(html)) !== null) {
results.push({
url: match[1],
title: match[2].replace(/<\/?[^>]+(>|$)/g, '').trim(),
snippet: match[3].replace(/<\/?[^>]+(>|$)/g, '').trim()
})
}
resolve({ status: res.statusCode, count: results.length, results })
})
})
req.on('error', reject)
req.end()
})
}

searchYahoo("шредер для гілок prom ua ціна").then(r => console.log(r)).catch(console.error)
