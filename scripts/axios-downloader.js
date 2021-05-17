
const { writeFileSync, existsSync, mkdirSync, readFileSync } = require('fs');
const axios = require('axios').default;

const mkdirIfNotExists = (directory) => {
    if (!existsSync(directory)) {
        mkdirSync(directory);
    }
};

class AxiosDownloader {

    constructor({ outputDir }) {
        this.caching = true;
        this.outputDir = outputDir;
        mkdirIfNotExists(this.outputDir);
    }

    makeOutPath(outname) {
        return `${this.outputDir}/${outname}`;
    }

    async downloadString(url) {
        const response = await axios.get(url);
        return response.data;
    }

    async downloadWeb(outname, url) {
        console.log(`${url} -> ${outname}`);
        const response = await axios.get(url);

        const outpath = this.makeOutPath(outname);
        writeFileSync(outpath, response.data);

        return response.data;
    }

    async downloadOnce(outname, url) {
        const outpath = this.makeOutPath(outname);
        if (!existsSync(outpath)) {
            return this.downloadWeb(outname, url);
        }
        else {
            console.log(`cached ${outname}`);
            const src = readFileSync(outpath, 'utf-8');
            return src;
        }
    }

    async download(outname, url) {
        if (this.caching) {
            return this.downloadOnce(outname, url);
        } else {
            return this.downloadWeb(outname, url);
        }
    }

}

module.exports = AxiosDownloader;

