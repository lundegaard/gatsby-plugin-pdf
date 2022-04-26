import puppeteer from 'puppeteer';
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

const generatePdf = async ({
	pagePath,
	outputPath = 'public/exports',
	filePrefix,
	pdfOptions = {},
	styleTagOptions,
}) => {
	const currentDir = process.cwd();
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	const htmlPath = path.join(currentDir, 'public', pagePath, 'index.html');
	const downloadDir = path.join(currentDir, outputPath);

	if (!fs.existsSync(downloadDir)) {
		fs.mkdirSync(downloadDir);
	}

	const contentHtml = fs.readFileSync(htmlPath, 'utf8');
	await page.setContent(contentHtml);

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
};

exports.onPostBuild = async (options, { allPages = false, paths = [], ...restProps }) => {
	const pageNodes = options
		.getNodes()
		.map(({ path }) => path)
		.filter((path) => path !== undefined && path !== DEV_PAGE && !fileRegexp.test(path));

	if (allPages && allPages.toLowerCase() !== 'false') {
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
