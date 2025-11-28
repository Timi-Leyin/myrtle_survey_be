/**
 * Express App Configuration
 */

import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import questionnaireRoutes from "./routes/questionnaire.routes";
import adminRoutes from "./routes/admin.routes";

const app: Express = express();

// Middleware - order matters!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (after body parsing)
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request with parsed body
  if (req.method !== "GET" && Object.keys(req.body || {}).length > 0) {
    console.log(`[${timestamp}] ${req.method} ${req.path}`, {
      query: req.query,
      body: req.body,
    });
  } else {
    console.log(`[${timestamp}] ${req.method} ${req.path}`, {
      query: req.query,
    });
  }

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Myrtle Wealth Blueprint Engine API",
      version: "1.0.0",
      description: "Backend API for the Myrtle Wealth Blueprint Questionnaire",
      contact: {
        name: "Myrtle Wealth",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        QuestionnaireSubmission: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string" },
            gender: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            occupation: { type: "string" },
            address: { type: "string" },
            maritalStatus: { type: "string" },
            dependantsCount: { type: "integer" },
            answers: { $ref: "#/components/schemas/QuestionnaireAnswers" },
          },
          required: [
            "fullName",
            "email",
            "phone",
            "gender",
            "dateOfBirth",
            "occupation",
            "address",
            "maritalStatus",
            "dependantsCount",
            "answers",
          ],
        },
        QuestionnaireAnswers: {
          type: "object",
          properties: {
            Q1: { type: "string", enum: ["A", "B", "C", "D"] },
            Q2: { type: "string", enum: ["A", "B", "C", "D"] },
            Q3: { type: "string", enum: ["A", "B", "C", "D"] },
            Q4: { type: "string", enum: ["A", "B", "C", "D"] },
            Q5: { type: "string", enum: ["A", "B", "C", "D"] },
            Q6: { type: "string", enum: ["A", "B", "C", "D"] },
            Q7: { type: "string", enum: ["A", "B", "C", "D"] },
            Q8: { type: "string", enum: ["A", "B", "C", "D"] },
            Q9: { type: "string", enum: ["A", "B", "C", "D"] },
            Q10: { type: "string", enum: ["A", "B", "C", "D"] },
            Q11: { type: "string", enum: ["A", "B", "C", "D"] },
            Q12: { type: "string", enum: ["A", "B", "C", "D"] },
            Q13: { type: "string", enum: ["A", "B", "C", "D"] },
            Q14: { type: "string", enum: ["A", "B", "C", "D"] },
            Q15: {
              type: "string",
              description: "Source of funds (optional text field)",
            },
            advisorQuestion: {
              type: "string",
              description: "Optional advisor question (text field)",
            },
          },
          required: [
            "Q1",
            "Q2",
            "Q3",
            "Q4",
            "Q5",
            "Q6",
            "Q7",
            "Q8",
            "Q9",
            "Q10",
            "Q11",
            "Q12",
            "Q13",
            "Q14",
          ],
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/admin", adminRoutes);

// Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.error(`\n❌ [${timestamp}] Error occurred:`);
  console.error(`   Method: ${req.method}`);
  console.error(`   Path: ${req.path}`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack:`, err.stack);
  console.error("");
  
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;

