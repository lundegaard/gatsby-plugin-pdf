<h1 align="center">
    gatsby-plugin-pdf
</h1>

<p align="center">
  <a href="https://lundegaard.eu">
    <img alt="by Lundegaard" src="./by-lundegaard.png" width="120" />
  </a>
</p>

<h3 align="center">
🖨 ⚙ 🔌  
</h3>

<h3 align="center">
Gatsby plugin that is able generate PDFs out of your gatsby web pages
</h3>

<p align="center">
With the plugin you are able to generate PDFs out of your gatsby web pages. PDFs are created during build time and so you are able to store them into a folder from which you can serve them later on the web.
</p>

<p align="center">
  <a href="https://github.com/lundegaard/gatsby-plugin-pdf">
    <img src="https://flat.badgen.net/badge/-/github?icon=github&label" alt="Github" />
  </a>

   <img src="https://flat.badgen.net/badge/license/MIT/blue" alt="MIT License" />

   <a href="https://www.npmjs.com/package/gatsby-plugin-pdf">
    <img src="https://flat.badgen.net/npm/dm/gatsby-plugin-pdf" alt="Downloads" />
  </a>

   <a href="https://www.npmjs.com/package/gatsby-plugin-pdf">
    <img src=" https://flat.badgen.net/npm/v/gatsby-plugin-pdf" alt="Version" />
  </a>
</p>

## Installation

Setup your [gatsby project](https://www.gatsbyjs.com/) and add `gatsby-plugin-pdf` as your dependency

```bash
yarn add gatsby-plugin-pdf
```

```bash
npm install gatsby-plugin-pdf
```

## Usage

In your gatsby project add a plugin definition into your `gatsby-plugin.js` config.

**Example 1**: Exporting pages /page1, /page2 and a root index.html denoted by single '/' in the config below.

```js
module.exports = {
	...
	plugins: [
		...
		{
			resolve: 'gatsby-plugin-pdf',
			options: {
				paths: ['/', '/page1', '/page2'],
				outputPath: '/public/exports',
			},
		},
	],
};

```

**Example 2**: Exporting all pages with additional inline style.

```js
module.exports = {
	...
	plugins: [
		...
		{
			resolve: 'gatsby-plugin-pdf',
			options: {
				allPages: true,
				styleTagOptions: {
					content: 'header{display:none;} footer{display:none;} .cookie-bar{display:none;}'
				}
			},
		},
	],
};

```

## Configuration options

- `allPages` <[boolean]> When true all pages will be converted to PDF files. Defaults to false. Either `allPages` or `paths` property must be specified.
- `styleTagOptions` <[Object]> Optional configuration. See addStyleTag puppeteer options: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#pageaddstyletagoptions.
  - `url` <[string]> URL of the `<link>` tag.
  - `path` <[string]> Path to the CSS file to be injected into frame. If path is a relative path, then it is resolved relative to current working directory.
  - `content` <[string]> Raw CSS content to be injected into frame.
- `filePrefix` <[string]> Optional prefix for exported PDF file.
- `outputPath` <[string]> Optional path where to store generated PDFs. Relative to current project dir. Defaults to `/public/exports`.
- `paths` <[Array]<[string]>> Array of page paths to convert to PDF. Path have to start with a leading /. You can pass nested paths like '/path/subpath'. For the root path use just single '/'. Either `allPages` or `paths` property must be specified.
- `pdfOptions` <[Object]> Optional configuration. See pdf puppeteer options: https://github.com/puppeteer/puppeteer/blob/v5.5.0/docs/api.md#pagepdfoptions.

## Contribution

We are open to any ideas and suggestions! Feel free to make PR!

See [contribution guide](https://github.com/lundegaard/gatsby-plugin-pdf/blob/main/CONTRIBUTING.md) for guidelines.
<br />
<br />

## See our related projects

- [@redux-tools](https://github.com/lundegaard/redux-tools) - Modular Redux is possible!
- [react-union](https://github.com/lundegaard/react-union) - Intergrate React apps into various CMSs seamlessly.
- [validarium](https://github.com/lundegaard/validarium) - Validations done right.
- [apium](https://github.com/lundegaard/apium) - Redux middleware for event-driven HTTP requests with async/await support.

© 2020 Lundegaard a.s.
