const { parse } = require("csv-parse/sync");

function parseCsv(csvText) {
    const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    return records;
}

module.exports = {
    parseCsv
};