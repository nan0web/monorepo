#!/usr/bin/env node

import Logger from '@nan0web/log'
import { to, FullObject } from '@nan0web/types'
import {
	Identity,
	Connection,
	Post,
	Media,
	Interaction,
	Good,
	Event,
	Contact,
} from '../src/index.js'
import { pause } from '@nan0web/ui-cli'

export async function runFractal7iDemo(console) {
	console.clear()
	await pause(33)
	console.success('🌟 Фрактал Семи (7i) — Онтологічна Веб-пісочниця')
	console.info('Презентація 7 базових веб-сутностей екосистеми @nan0web/co\n')

	// 1. Identity
	console.info(Logger.style('1. 👤 Identity (Субʼєкт / Автор):', { color: 'cyan', bold: true }))
	const creator = new Identity({
		id: 'yaraslove',
		type: 'person',
		title: 'ЯRаСлав (АрхіТехноМаг)',
		endpoints: [
			'mailto:support@yaro.page',
			'tel:+380991234567',
			'https://github.com/nan0web',
		],
	})
	console.info(`   • DID: ${creator.did}`)
	console.info(`   • Назва/Імʼя: ${creator.name}`)
	console.info(`   • Кількість розпізнаних Contact-ів: ${creator.contacts.length}`)
	console.info(`   • Контакти (текстовий OLMUI вигляд): ${creator.contacts.map((c) => c.toText()).join(' | ')}`)
	await pause(500)

	// 2. Good
	console.info('\n' + Logger.style('2. 💎 Good (Цінність / Товар / Послуга):', { color: 'green', bold: true }))
	const good = new Good({
		id: 'architechnomag-mentoring',
		type: 'service',
		title: 'АрхіТехноМагічне Наставництво',
		price: { amount: 500, currency: 'USDT' },
		currency: 'USDT',
		features: ['Архітектура OLMUI', 'Фрактал Семи (7i)', 'Zero-Dependency Контракти'],
	})
	console.info(`   • Послуга: ${good.title}`)
	console.info(`   • Вартість: ${good.amount} ${good.currency}`)
	console.info(`   • Особливості: ${good.features.join(', ')}`)
	await pause(500)

	// 3. Media
	console.info('\n' + Logger.style('3. 🖼️ Media (Артефакт / Ресурс):', { color: 'yellow', bold: true }))
	const media = new Media({
		id: 'fractal-banner',
		uri: 'https://cdn.nan0.web/assets/banner.webp',
		mime: 'image/webp',
		title: 'Фрактал 7i Візуалізація',
		width: 1920,
		height: 1080,
		filesize: 852000,
	})
	console.info(`   • Файл: ${media.title} (${media.uri})`)
	console.info(`   • Автоматичний тип: ${media.type} (з MIME: ${media.mime})`)
	console.info(`   • Розміри: ${media.width}x${media.height} px, ${(media.filesize / 1024).toFixed(1)} KB`)
	await pause(500)

	// 4. Post
	console.info('\n' + Logger.style('4. 📰 Post (Публікація / Контент):', { color: 'magenta', bold: true }))
	const post = new Post({
		id: 'release-co-v3-6-0',
		type: 'news',
		title: 'Офіційний реліз @nan0web/co v3.6.0',
		author: creator.endpoints[0],
		tags: ['nan0web', 'release', 'fractal7i'],
		media: [media.uri],
		status: 'live',
	})
	console.info(`   • Заголовок: ${post.title}`)
	console.info(`   • Статус: ${post.status}`)
	console.info(`   • Автор: ${post.author?.toText()}`)
	console.info(`   • Теги: ${post.tags.join(', ')}`)
	await pause(500)

	// 5. Event
	console.info('\n' + Logger.style('5. ⏳ Event (Подія / Локація / Час):', { color: 'blue', bold: true }))
	const event = new Event({
		id: 'demo-meetup-2026',
		type: 'event',
		title: 'Демонстрація Фракталу Семи наживо',
		location: 'Київ, вул. Велика Васильківська / Онлайн',
		starts_at: '2026-11-20T18:00:00.000Z',
		ends_at: '2026-11-20T20:00:00.000Z',
		contacts: [creator.endpoints[1]],
	})
	console.info(`   • Подія: ${event.title}`)
	console.info(`   • Локація: ${event.location}`)
	console.info(`   • Час: ${new Date(event.starts_at).toUTCString()} — ${new Date(event.ends_at).toUTCString()}`)
	await pause(500)

	// 6. Interaction
	console.info('\n' + Logger.style('6. 📨 Interaction (Взаємодія / Заявка):', { color: 'cyan', bold: true }))
	const order = new Interaction({
		id: 'order-777',
		type: 'order',
		title: 'Замовлення наставництва',
		status: 'intake',
		sender: 'mailto:student@community.org',
		payload: {
			good_id: good.id,
			total: good.amount,
			currency: good.currency,
			ordered_at: new Date().toISOString(),
		},
	})
	console.info(`   • Звернення: ${order.title} (Тип: ${order.type})`)
	console.info(`   • Статус: ${order.status}`)
	console.info(`   • Замовник: ${order.sender?.toText()}`)
	console.info(`   • Контракт Payload (OrderPayload): ${JSON.stringify(order.payload)}`)
	await pause(500)

	// 7. Connection
	console.info('\n' + Logger.style('7. 🔗 Connection (Звʼязок / Навігація):', { color: 'white', bold: true }))
	const menu = new Connection({
		id: 'site-header-menu',
		type: 'navigation',
		role: 'header',
		title: 'Головне меню сайту',
		items: [
			{
				title: 'Про автора',
				url: `/${creator.id}`,
				items: [
					{ title: 'Біографія / Маніфест', url: `/${creator.id}#bio` },
					{ title: 'Контакти та ключі', url: `/${creator.id}#contacts` },
				],
			},
			{
				title: 'Послуги',
				url: `/${good.id}`,
				items: [
					{ title: 'АрхіТехноМагічне Наставництво', url: `/${good.id}` },
					{ title: 'Корпоративний аудит', url: '/services/audit' },
				],
			},
			{ title: 'Анонс події', url: `/${event.id}` },
		],
	})
	console.info(`   • Меню: ${menu.title} (Роль: ${menu.role})`)
	console.info(`   • Багаторівнева навігація:`)
	for (const item of menu.items) {
		console.info(`     ↳ [${item.title}] -> ${item.url}`)
		if (Array.isArray(item.items)) {
			for (const sub of item.items) {
				console.info(`        └── [${sub.title}] -> ${sub.url}`)
			}
		}
	}

	console.info('\n' + '='.repeat(50))
	console.success('✨ Фрактал Семи повністю узгоджений і звʼязаний між собою!')
	console.info('='.repeat(50) + '\n')
}
