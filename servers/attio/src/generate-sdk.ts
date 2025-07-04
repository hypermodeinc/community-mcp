import { createClient } from "@hey-api/openapi-ts";
import { config } from "dotenv";

config();

const client = createClient({
  input: {
    path:
      process.env["ATTIO_OPENAPI_URL"] || "https://api.attio.com/openapi/api",
    api_key: process.env["ATTIO_API_KEY"] || "",
  },
  output: "src/generated/",
  logs: {
    level: "silent",
  },
});

client
  .then(() => {
    console.log("SDK generated successfully");
  })
  .catch((error) => {
    console.error("Error generating SDK:", error);
  });
