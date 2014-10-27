{
  "name": "bi_open",
  "version": "",
  "comment": "Business Intelligence",
  "loadOrder": 50,
  "dependencies": [],
  "databaseScripts": [
    "create-bi-open-schema.sql",
    "usrbichart.sql",
    "public/tables/metric.sql"
  ],
  "routes": [
    {
      "path": "queryOlap",
      "filename": "routes/olapdata.js",
      "functionName": "queryOlapCatalog"
    }
  ]
}
