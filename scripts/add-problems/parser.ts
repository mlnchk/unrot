import * as cheerio from 'cheerio'
import TurndownService from 'turndown'

const turndown = new TurndownService({
	headingStyle: 'atx',
	codeBlockStyle: 'fenced',
	emDelimiter: '*',
	strongDelimiter: '**',
})

turndown.keep(['sup', 'sub'])

export type ParsedProblem = {
	title: string
	markdown: string
}

export async function fetchHtml(url: string): Promise<string> {
	const response = await fetch(url)

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url} – received ${response.status}`)
	}

	return await response.text()
}

export function parseProblem(html: string, url: string): ParsedProblem {
	const $ = cheerio.load(html)

	$('script, style, nav, header, footer, iframe, noscript').remove()

	const titleText = $('h1').first().text().trim()
	if (!titleText) {
		throw new Error(`Unable to infer title for ${url}`)
	}

	const contentHtml =
		$('#content-area').html() ??
		$('main article').first().html() ??
		$('article').first().html()

	if (!contentHtml) {
		throw new Error(`Could not find #content-area for ${url}`)
	}

	const markdown = convertHtmlToMarkdown(contentHtml)

	if (markdown.length === 0) {
		throw new Error(`No content extracted for ${url}`)
	}

	return {
		title: titleText,
		markdown,
	}
}

function convertHtmlToMarkdown(html: string | null | undefined): string {
	if (!html) {
		return ''
	}

	const trimmed = html.trim()
	if (!trimmed) {
		return ''
	}

	const markdown = turndown.turndown(trimmed)
	return markdown.trim()
}
