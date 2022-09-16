import puppeteer from 'puppeteer';
import express from "express";
import fs from 'fs-extra';
import path from 'path';

const DEV_PAGE = '/dev-404-page/';
const fileRegexp = RegExp('.*.(html|htm)');

const normalizePageName = (pagePath = '') => {
	const normalizedFront = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath;
	const normalizedEnd = normalizedFront.endsWith('/')
		? normalizedFront.slice(0, -1)
		: normalizedFront;

	const pageName = normalizedEnd == '' ? 'index' : normalizedEnd.replace(/\//g, '-');

	return pageName;
};

async function runWithWebServer(body) {
	return new Promise((resolve, reject) => {
		const app = express();
		app.use(express.static(path.join(process.cwd(), 'public')))

		const server = app.listen(0, async () => {
			try {
				await body("http://localhost:" + server.address().port)
				server.close()
				resolve()
			} catch (err) {
				server.close()
				reject(err)
			}
		});
	})
}

const generatePdf = async ({
	pagePath,
	outputPath = 'public/exports',
	filePrefix,
	pdfOptions = {},
	styleTagOptions,
}) => {
	await runWithWebServer(async base => {
		const currentDir = process.cwd();
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		const downloadDir = path.join(currentDir, outputPath);

		if (!fs.existsSync(downloadDir)) {
			fs.mkdirSync(downloadDir);
		}

		await page.goto(base + pagePath, { waitUntil: 'networkidle0' });

		if (styleTagOptions) {
			await page.addStyleTag(styleTagOptions);
		}

		await page.pdf({
			format: 'A4',
			path: path.join(
				downloadDir,
				`${filePrefix ? filePrefix : ''}${normalizePageName(pagePath)}.pdf`
			),
			...pdfOptions,
		});

		await browser.close();
	});
};

exports.onPostBuild = async (options, { allPages = false, paths = [], ...restProps }) => {
	const pageNodes = options
		.getNodes()
		.map(({ path }) => path)
		.filter((path) => path !== undefined && path !== DEV_PAGE && !fileRegexp.test(path));

	if (allPages) {
		const promisses = pageNodes.map((pagePath) => generatePdf({ pagePath, ...restProps }));
		await Promise.all(promisses);
	} else {
		const promisses = paths.map((pagePath) => {
			if (pageNodes.includes(pagePath)) {
				return generatePdf({ pagePath, ...restProps });
			} else {
				console.warn(
					`Page path ${pagePath} for which you want generate PDF does not exist. Check gatsby-plugin-pdf configuration in your gatsby-config.js.`
				);
			}
		});
		await Promise.all(promisses);
	}
};

exports.pluginOptionsSchema = ({ Joi }) => {
	return Joi.object({
		allPages: Joi.boolean()
			.default(`false`)
			.description(`When true all pages will be converted to PDF files.`),
		filePrefix: Joi.string().description(`Optional prefix for exported PDF file`),
		outputPath: Joi.string()
			.default(`/public/exports`)
			.description(`Optional path where to store generated PDFs. Relative to current project dir.`),
		paths: Joi.array()
			.items(Joi.string())
			.min(1)
			.description(
				`Array of page paths to convert to PDF. Path have to start with a leading /. You can pass nested paths like '/path/subpath'. For the root path use just single '/'.`
			),
		pdfOptions: Joi.object().description(
			`See pdf puppeteer options: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#pagepdfoptions.`
		),
		styleTagOptions: Joi.object({
			url: Joi.string().description(`URL of the <link> tag`),
			path: Joi.string().description(
				`Path to the CSS file to be injected into frame. If path is a relative path, then it is resolved relative to current working directory.`
			),
			content: Joi.string().description(`Raw CSS content to be injected into frame.`),
		}).description(
			`See addStyleTag puppeteer options: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#pageaddstyletagoptions.`
		),
	});
};
