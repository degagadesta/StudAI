import "./src/config/env.js"; // must run first — loads .env before anything else reads process.env
import app from "./app.js";

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
