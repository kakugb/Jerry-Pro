const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const { spawn } = require("child_process");
const xlsx = require("xlsx");
const fs = require("fs");
const csv = require("csv-parser"); // CSV parser
const bcrypt = require('bcrypt');


const app = express();
const port = 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Saltorovi@786", // Replace with your MySQL password
  database: "jerry", // Ensure this database exists
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// Ensure "Chat_logs_new" table exists
db.query(
  `CREATE TABLE IF NOT EXISTS Chat_logs_new (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chatbot_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    chat_log JSON NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  (err) => {
    if (err) console.error("Error creating Chat_logs_new table:", err);
  }
);

// Create "datasources" table if not exists
db.query(
  `CREATE TABLE IF NOT EXISTS data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    size VARCHAR(50),
    last_sync VARCHAR(50),
    content TEXT
  )`,
  (err) => {
    if (err) {
      console.error("Error creating data_sources table:", err);
    } else {
      console.log("data_sources table created successfully.");
    }
  }
);




// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedFormats = ["pdf", "csv", "json", "txt", "ppt", "pptx", "doc", "docx", "xls", "xlsx"];
    const fileExtension = file.originalname.split(".").pop().toLowerCase();
    if (allowedFormats.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format"));
    }
  },
});


// Login Endpoint
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role:user.role
      },
    });
  });
});

// Signup Endpoint
app.post("/api/signup", async (req, res) => {
  const { email, username, password, role } = req.body;

  // Validate input fields
  if (!email || !username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if the user already exists
  const checkUserSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserSql, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into the database
    const insertUserSql = "INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)";
    db.query(insertUserSql, [email, username, hashedPassword, role], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Error creating user" });
      }

      // Respond with success
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: results.insertId,
          email: email,
          username: username,
          role: role,
        },
      });
    });
  });
});



// Save Chat Logs to Chat_logs_new
app.post("/api/Chat_logs_new", (req, res) => {
  const { userId, chatbotId, sessionId, chatLog } = req.body;

  if (!userId || !chatbotId || !sessionId || !chatLog) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO Chat_logs_new (user_id, chatbot_id, session_id, chat_log)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [userId, chatbotId, sessionId, JSON.stringify(chatLog)], (err, results) => {
    if (err) {
      console.error("Error saving chat log to database:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json({
      message: "Chat log saved successfully",
      data: { insertId: results.insertId },
    });
  });
});

// Fetch Chat Logs by session ID, user ID, and chatbot ID
app.get("/api/Chat_logs_new", (req, res) => {
  const { sessionId, userId, chatbotId } = req.query;

  if (!userId || !chatbotId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const sql = sessionId
    ? `SELECT * FROM Chat_logs_new WHERE session_id = ? AND user_id = ? AND chatbot_id = ?`
    : `SELECT DISTINCT session_id FROM Chat_logs_new WHERE user_id = ? AND chatbot_id = ?`;

  const params = sessionId ? [sessionId, userId, chatbotId] : [userId, chatbotId];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching chat logs from database:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    res.status(200).json({
      message: "Records retrieved successfully",
      data: results,
    });
  });
});

// Proxy to Flask Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const fastApiResponse = await fetch("http://127.0.0.1:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!fastApiResponse.ok) {
      throw new Error(`FastAPI error: ${fastApiResponse.statusText}`);
    }

    const data = await fastApiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error forwarding chat request to Flask API:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Fetch all session IDs for a specific chatbot
app.get("/api/sessions", (req, res) => {
  const { chatbotId, userId } = req.query;

  if (!chatbotId || !userId) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  const sql = `
    SELECT DISTINCT session_id FROM Chat_logs_new
    WHERE chatbot_id = ? AND user_id = ?
  `;

  db.query(sql, [chatbotId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching session IDs from database:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No sessions found for the given chatbot" });
    }

    res.status(200).json({
      message: "Session IDs retrieved successfully",
      data: results.map((row) => row.session_id),
    });
  });
});

// Fetch chat logs for a specific session
app.get("/api/sessionChatLogs", (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const sql = `
    SELECT chat_log FROM Chat_logs_new
    WHERE session_id = ?
  `;

  db.query(sql, [sessionId], (err, results) => {
    if (err) {
      console.error("Error fetching chat logs for session:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No chat logs found for the given session ID" });
    }

    res.status(200).json({
      message: "Chat logs retrieved successfully",
      data: results.map((row) => JSON.parse(row.chat_log)),
    });
  });
});

// Knowledge Base Endpoints

// Fetch all knowledge bases
// Middleware to fetch the active knowledge base ID
const fetchActiveKnowledgeBase = (req, res, next) => {
  db.query(`SELECT id FROM knowledge_bases WHERE isActive = TRUE LIMIT 1`, (err, results) => {
    if (err) {
      console.error("Error fetching active knowledge base:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (results.length === 0) {
      console.warn("No active knowledge base found.");
      return res.status(404).json({ message: "No active knowledge base found." });
    }
    req.activeKnowledgeBaseId = results[0].id;
    console.log(`Fetched Active Knowledge Base ID: ${req.activeKnowledgeBaseId}`);
    next();
  });
};


// Fetch all knowledge bases
app.get("/api/knowledgeBases", (req, res) => {
  db.query(`SELECT * FROM knowledge_bases`, (err, results) => {
    if (err) {
      console.error("Error fetching knowledge bases:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json({ data: results });
  });
});

// Set a specific knowledge base as active
app.post("/api/knowledgeBases/setActive", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Knowledge base ID is required" });
  }

  db.query(`UPDATE knowledge_bases SET isActive = FALSE`, (err) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    db.query(`UPDATE knowledge_bases SET isActive = TRUE WHERE id = ?`, [id], (err) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.status(200).json({ message: "Knowledge base set as active successfully" });
    });
  });
});

// Fetch the active knowledge base
app.get("/api/knowledgeBases/active", (req, res) => {
  db.query(`SELECT * FROM knowledge_bases WHERE isActive = TRUE LIMIT 1`, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No active knowledge base found" });
    }
    res.status(200).json({ data: results[0] });
  });
});

// Add a new knowledge base
app.post("/api/knowledgeBases", (req, res) => {
  const { title, description } = req.body;

  // Validate required fields
  if (!title || !description) {
    return res.status(400).json({
      message: "Title and description are required.",
    });
  }

  // Insert the knowledge base into the database
  const query = `
    INSERT INTO knowledge_bases (title, description, isActive)
    VALUES (?, ?, FALSE)
  `;

  db.query(query, [title, description], (err, results) => {
    if (err) {
      console.error("Error adding knowledge base:", err);
      return res.status(500).json({
        message: "Database error",
        error: err,
      });
    }

    res.status(201).json({
      message: "Knowledge base added successfully!",
      id: results.insertId,
    });
  });
});


app.post("/chat", fetchActiveKnowledgeBase, (req, res) => {
  const { query, knowledge_base_id } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required." });
  }

  // Use the passed `knowledge_base_id` instead of relying on the active KB middleware
  const activeKnowledgeBaseId = knowledge_base_id;

  db.query(
    `SELECT * FROM knowledge_base_data WHERE knowledge_base_id = ? AND MATCH(content) AGAINST(?)`,
    [activeKnowledgeBaseId, query],
    (err, results) => {
      if (err) {
        console.error("Error querying knowledge base:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.status(200).json({ data: results });
    }
  );
});


// Handle a query to the active knowledge base
app.post("/api/queryKnowledgeBase", fetchActiveKnowledgeBase, (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: "Query is required." });
  }

  const activeKnowledgeBaseId = req.activeKnowledgeBaseId;

  db.query(
    `SELECT * FROM knowledge_base_data WHERE knowledge_base_id = ? AND MATCH(content) AGAINST(?)`,
    [activeKnowledgeBaseId, query],
    (err, results) => {
      if (err) {
        console.error("Error querying knowledge base:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.status(200).json({ data: results });
    }
  );
});

// Middleware to log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log(`Request body:`, req.body);
  next();
});




// Train the knowledge base
app.get("/api/knowledgeBases", (req, res) => {
  const query = `
    SELECT id, title, description, isActive
    FROM knowledge_bases
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching knowledge bases:", err);
      return res.status(500).json({
        message: "Database error",
        error: err,
      });
    }

    res.status(200).json({ data: results });
  });
});

// Helper function to detect content type
// Improved Helper Function to Detect Content Type
// Improved Helper Function to Detect Content Type
const detectContentType = (content) => {
  // Check if content is a URL
  if (content.startsWith("http://") || content.startsWith("https://")) {
    if (content.includes("youtube.com") || content.includes("youtu.be")) {
      return "youtube";
    }
  }

  // Check if content is JSON
  try {
    const parsedContent = JSON.parse(content);
    if (typeof parsedContent === "object" && parsedContent !== null) {
      return "json"; // It's valid JSON
    }
  } catch (error) {
    // Ignore JSON parsing errors
  }

  // Check if content ends with specific file extensions
  if (content.trim().endsWith(".txt")) {
    return "text";
  } else if (content.trim().endsWith(".xls") || content.trim().endsWith(".xlsx")) {
    return "excel";
  }

  // If none of the above, classify as text (plain content)
  if (typeof content === "string" && content.trim().length > 0) {
    return "text";
  }

  // Default fallback
  return "unknown";
};


// API endpoint
app.post("/api/trainKnowledgeBase", (req, res) => {
  const { knowledgeBaseId, dataSourceIds } = req.body;

  if (!knowledgeBaseId || !dataSourceIds || dataSourceIds.length === 0) {
    return res
      .status(400)
      .json({ message: "Knowledge Base ID and Data Sources are required." });
  }

  console.log("Training request received with knowledgeBaseId:", knowledgeBaseId);
  console.log("Training request received with dataSourceIds:", dataSourceIds);

  // Fetch selected data sources from the database
  db.query(
    "SELECT content FROM data_sources WHERE id IN (?)",
    [dataSourceIds],
    (err, dataSources) => {
      if (err) {
        console.error("Error fetching data sources:", err);
        return res
          .status(500)
          .json({ message: "Failed to fetch data sources.", error: err });
      }

      if (dataSources.length === 0) {
        return res
          .status(404)
          .json({ message: "No data sources found for the given IDs." });
      }

      // Collect content (URLs or text)
      const content = dataSources.map((ds) => ds.content);

      if (content.length === 0) {
        return res
          .status(400)
          .json({ message: "No valid content found in the selected data sources." });
      }

      // Detect content types for all data sources
      const contentTypes = content.map((item) => detectContentType(item));

      console.log("Detected content types:", contentTypes);

      // Determine which Python script to use
      const scriptMapping = {
        youtube: "train.py",
        json: "jsoncode.py",
        text: "textfile.py",
        excel: "excel.py",
      };

      // Map the detected content types to Python scripts
      const scriptsToCall = contentTypes.map((type) => scriptMapping[type] || "unknown");

      if (scriptsToCall.includes("unknown")) {
        return res.status(400).json({
          message: "One or more content types could not be processed.",
          details: contentTypes,
        });
      }

      console.log("Scripts to call:", scriptsToCall);

      // Call the appropriate Python script for each content type
      const pythonProcesses = scriptsToCall.map((script, index) => {
        console.log(`Calling ${script} with content:`, content[index]);
        return new Promise((resolve, reject) => {
          const pythonProcess = spawn("python", [script, knowledgeBaseId, content[index]]);

          pythonProcess.stdout.on("data", (data) => {
            console.log(`${script} output:`, data.toString());
          });

          pythonProcess.stderr.on("data", (data) => {
            console.error(`${script} error:`, data.toString());
          });

          pythonProcess.on("close", (code) => {
            console.log(`${script} exited with code:`, code);
            if (code === 0) {
              resolve({ script, status: "success" });
            } else {
              reject({ script, status: "failed" });
            }
          });
        });
      });

      // Wait for all Python scripts to complete
      Promise.allSettled(pythonProcesses)
        .then((results) => {
          const failures = results.filter((result) => result.status === "rejected");
          if (failures.length > 0) {
            console.error("Some scripts failed:", failures);
            return res.status(500).json({
              message: "One or more training processes failed.",
              details: failures,
            });
          }

          console.log("All scripts executed successfully.");
          res.status(200).json({
            message: "Training completed successfully for all data sources.",
          });
        })
        .catch((error) => {
          console.error("Error executing scripts:", error);
          res.status(500).json({ message: "Error executing scripts.", error });
        });
    }
  );
});


app.get("/api/datasources", (req, res) => {
  const sql = "SELECT id, name, type, size FROM data_sources ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching datasources:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json({
      message: "Datasources fetched successfully",
      data: results, // Only `id`, `name`, `type`, and `size` are sent to the frontend
    });
  });
});


app.post("/api/addDataSource", upload.single("file"), (req, res) => {
  const { text, youtubeUrl } = req.body;
  const file = req.file;

  if (!text && !youtubeUrl && !file) {
    return res.status(400).json({ message: "Please provide a valid data source." });
  }

  let dataSource = { name: "", type: "", size: "-", lastSync: new Date().toLocaleString(), content: null };

  if (file) {
    dataSource.name = file.originalname;
    dataSource.size = `${file.size} bytes`;

    // Determine the type based on file extension
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

    if (fileExtension === "csv") {
      // Process CSV File
      const results = [];
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          try {
            dataSource.content = JSON.stringify(results);
            dataSource.type = "csv";
            saveToDatabase(dataSource, res);
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error("Error saving CSV content:", err);
            return res.status(500).json({ message: "Failed to process CSV file.", error: err });
          }
        })
        .on("error", (err) => {
          console.error("Error processing CSV file:", err);
          return res.status(500).json({ message: "Failed to process CSV file.", error: err });
        });
    } else if (["xls", "xlsx"].includes(fileExtension)) {
      // Process Excel File
      try {
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        dataSource.content = JSON.stringify(sheetData);
        dataSource.type = "excel";
        saveToDatabase(dataSource, res);
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error("Error processing Excel file:", err);
        return res.status(500).json({ message: "Failed to process Excel file.", error: err });
      }
    } else if (["txt", "json", "doc"].includes(fileExtension)) {
      // Process Text Files
      try {
        const fileContent = fs.readFileSync(file.path, 'utf8');
        dataSource.content = fileContent;
        dataSource.type = fileExtension; // Set type as the file extension (txt, json, or doc)
        
        // If it's a JSON file, validate the content
        if (fileExtension === 'json') {
          try {
            JSON.parse(fileContent); // Validate JSON format
          } catch (jsonError) {
            fs.unlinkSync(file.path);
            return res.status(400).json({ message: "Invalid JSON format" });
          }
        }
        
        saveToDatabase(dataSource, res);
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error processing ${fileExtension} file:`, err);
        return res.status(500).json({ message: `Failed to process ${fileExtension} file.`, error: err });
      }
    } else {
      // Unsupported file type
      return res.status(400).json({ 
        message: "Unsupported file format. Allowed formats: CSV, Excel, TXT, JSON, DOC" 
      });
    }
  } else if (youtubeUrl) {
    dataSource.name = "YouTube Video";
    dataSource.type = "youtube_bulk";
    dataSource.size = "-";
    dataSource.content = youtubeUrl;
    saveToDatabase(dataSource, res);
  } else if (text) {
    dataSource.name = "Text Data";
    dataSource.type = "text";
    dataSource.size = `${text.length} chars`;
    dataSource.content = text;
    saveToDatabase(dataSource, res);
  }
});

// Helper function to save to the database
const saveToDatabase = (dataSource, res) => {
  const sql = `
    INSERT INTO data_sources (name, type, size, last_sync, content)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [dataSource.name, dataSource.type, dataSource.size, dataSource.lastSync, dataSource.content],
    (err, result) => {
      if (err) {
        console.error("Error saving data source:", err);
        return res.status(500).json({ message: "Failed to save data source.", error: err });
      }

      res.status(200).json({ message: "Data source added successfully." });
    }
  );
};



app.delete("/api/datasources/:id", (req, res) => {
  const { id } = req.params;

  // Check if datasource exists
  const fetchSql = "SELECT * FROM data_sources WHERE id = ?";
  db.query(fetchSql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching datasource for deletion:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Datasource not found" });
    }

    const datasource = results[0];

    // If file_path exists, delete the file from storage
    if (datasource.file_path) {
      const filePath = path.join(__dirname, datasource.file_path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    // Delete the datasource from the database
    const deleteSql = "DELETE FROM data_sources WHERE id = ?";
    db.query(deleteSql, [id], (err) => {
      if (err) {
        console.error("Error deleting datasource from database:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.status(200).json({ message: "Datasource deleted successfully" });
    });
  });
});


app.put("/api/datasources/:id", (req, res) => {
  const { id } = req.params;
  const { name, type, size, lastSync } = req.body;

  // Validate required fields
  if (!name || !type || !size || !lastSync) {
    return res.status(400).json({ message: "All fields (name, type, size, lastSync) are required." });
  }

  const sql = `
    UPDATE data_sources
    SET name = ?, type = ?, size = ?, last_sync = ?
    WHERE id = ?
  `;

  db.query(sql, [name, type, size, lastSync, id], (err, results) => {
    if (err) {
      console.error("Error updating datasource:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Datasource not found" });
    }

    res.status(200).json({ message: "Datasource updated successfully" });
  });
});


app.get("/api/datasources/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM data_sources WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching datasource:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Datasource not found" });
    }

    res.status(200).json({
      message: "Datasource fetched successfully",
      data: results[0],
    });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
