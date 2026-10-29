const path = require("path");
const jiti = require("jiti")(path.resolve("package.json"), {
  jsx: true,
  alias: {
    "@": path.resolve("."),
  },
});

jiti("./tests/enrollment-payment-notifications.test.ts");
