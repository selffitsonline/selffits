const path = require("path");
const jiti = require("jiti")(path.resolve("package.json"), {
  alias: {
    "@": path.resolve("."),
  },
});

jiti("./tests/admin-release-email.test.ts");

