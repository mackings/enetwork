require("dotenv").config();
const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

function serialize(value) {
    if (value === null || value === undefined) return "";
    if (value instanceof mongoose.Types.ObjectId) return value.toString();
    if (value instanceof Date) return value;
    if (Buffer.isBuffer(value)) return value.toString("hex");
    if (typeof value === "object") return JSON.stringify(value);
    return value;
}

async function main() {
    await mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection.db;
    console.log("Connected to database:", db.databaseName);

    const collections = await db.listCollections().toArray();
    const workbook = new ExcelJS.Workbook();

    for (const { name } of collections) {
        const docs = await db.collection(name).find({}).toArray();
        const sheet = workbook.addWorksheet(name.slice(0, 31));

        if (docs.length === 0) {
            sheet.addRow(["(no documents)"]);
            console.log(`- ${name}: 0 documents`);
            continue;
        }

        const columns = Array.from(
            docs.reduce((set, doc) => {
                Object.keys(doc).forEach((k) => set.add(k));
                return set;
            }, new Set())
        );

        sheet.columns = columns.map((key) => ({ header: key, key, width: 22 }));
        docs.forEach((doc) => {
            const row = {};
            columns.forEach((key) => {
                row[key] = serialize(doc[key]);
            });
            sheet.addRow(row);
        });
        sheet.getRow(1).font = { bold: true };

        console.log(`- ${name}: ${docs.length} documents`);
    }

    const outDir = path.join(__dirname, "..", "exports");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(
        outDir,
        `test_db_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    await workbook.xlsx.writeFile(outPath);
    console.log("Exported to", outPath);

    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
