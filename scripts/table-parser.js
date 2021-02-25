
const RE_QUOTED_FIELD = /^\"(.*?)\"$/;
const RE_ALIASED_NAME = /^"(.*?)" \(as "(.*?)"\)$/

class TableParser {

    constructor({ knownFields }) {
        this.headers = null;
        this.rows = null;
        this.knownFields = knownFields || {};
    }

    init() {
        this.headers = [];
        this.rows = [];
    }

    clean() {
        this.headers = null;
        this.rows = null;
    }

    parseHeaders(table) {
        let headerEl = table.querySelector('th');
        while (headerEl) {
            this.headers.push(headerEl.textContent.trim());
            headerEl = headerEl.nextElementSibling;

            if (headerEl && headerEl.tagName !== 'TH') {
                headerEl = null;
            }
        }
    }

    isValidRow(row) {
        return (
            row.children.length === this.headers.length &&
            row.children[0].tagName === 'TD'
        );
    }

    checkAliasedName(data) {
        if (RE_ALIASED_NAME.test(data['Name'])) {
            const m = RE_ALIASED_NAME.exec(data['Name']);
            data['Name'] = m[1];
            data['originalName'] = m[2];
        }
    }

    parseRows(table) {
        for (let row of table.rows) {
            if (this.isValidRow(row)) {
                let data = {};
                for (let i = 0; i < this.headers.length; i++) {
                    let key = this.headers[i];
                    if (key in this.knownFields) {
                        key = this.knownFields[key];
                    }
                    let content = row.children[i].textContent.trim();
                    if (row.children[i].innerHTML.trim().includes('<br>')) {
                        content = [];
                        for (let child of row.children[i].children) {
                            if (child.tagName !== 'BR') {
                                content.push(child.textContent.trim());
                            }
                        }
                    }
                    if (RE_QUOTED_FIELD.test(content)) {
                        content = RE_QUOTED_FIELD.exec(content)[1];
                    }
                    data[key] = content;
                }
                this.checkAliasedName(data);
                this.rows.push(data);
            }
        }
    }

    parse(table) {
        this.init();
        this.parseHeaders(table);
        this.parseRows(table);
        const result = this.rows;
        this.clean();
        return result;
    }

}

module.exports = TableParser;

