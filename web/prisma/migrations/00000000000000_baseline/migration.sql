-- CreateTable
CREATE TABLE "Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "advantage" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "revenue" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "customers" TEXT NOT NULL,
    "competitors" TEXT NOT NULL,
    "marketing" TEXT NOT NULL,
    "risks" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "mvp" TEXT NOT NULL,
    "sources" TEXT NOT NULL,
    "projectId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Note" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "projectId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Memory_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" INTEGER NOT NULL,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "instructions" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "schedule" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "projectId" INTEGER NOT NULL,
    CONSTRAINT "ResearchJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchRun" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "summary" TEXT NOT NULL DEFAULT '',
    "report" TEXT NOT NULL DEFAULT '',
    "error" TEXT NOT NULL DEFAULT '',
    "researchJobId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchRun_researchJobId_fkey" FOREIGN KEY ("researchJobId") REFERENCES "ResearchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchFinding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT NOT NULL DEFAULT '',
    "sourceUrl" TEXT NOT NULL DEFAULT '',
    "sourceName" TEXT NOT NULL DEFAULT '',
    "opportunityScore" INTEGER NOT NULL DEFAULT 0,
    "frequency" INTEGER NOT NULL DEFAULT 50,
    "severity" INTEGER NOT NULL DEFAULT 50,
    "economicImpact" INTEGER NOT NULL DEFAULT 50,
    "evidenceStrength" INTEGER NOT NULL DEFAULT 50,
    "paymentPotential" INTEGER NOT NULL DEFAULT 50,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "rootCause" TEXT NOT NULL DEFAULT '',
    "consequence" TEXT NOT NULL DEFAULT '',
    "affectedUsers" TEXT NOT NULL DEFAULT '',
    "currentSolution" TEXT NOT NULL DEFAULT '',
    "opportunity" TEXT NOT NULL DEFAULT '',
    "trend" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "ResearchFinding_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchCluster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "ResearchCluster_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchClusterFinding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clusterId" INTEGER NOT NULL,
    "findingId" INTEGER NOT NULL,
    CONSTRAINT "ResearchClusterFinding_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "ResearchCluster" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResearchClusterFinding_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "ResearchFinding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RootCause" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    "parentId" INTEGER,
    CONSTRAINT "RootCause_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RootCause_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RootCause" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchGraphNode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    "findingId" INTEGER,
    CONSTRAINT "ResearchGraphNode_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResearchGraphNode_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "ResearchFinding" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchGraphEdge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "relation" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1,
    "fromNodeId" INTEGER NOT NULL,
    "toNodeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResearchGraphEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "ResearchGraphNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResearchGraphEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "ResearchGraphNode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetitorSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "competitor" TEXT NOT NULL,
    "website" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "strengths" TEXT NOT NULL DEFAULT '',
    "weaknesses" TEXT NOT NULL DEFAULT '',
    "pricing" TEXT NOT NULL DEFAULT '',
    "positioning" TEXT NOT NULL DEFAULT '',
    "targetMarket" TEXT NOT NULL DEFAULT '',
    "opportunityGap" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "CompetitorSnapshot_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchTrend" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "keyword" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "ResearchTrend_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerInterview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerType" TEXT NOT NULL,
    "interviewee" TEXT NOT NULL DEFAULT '',
    "painPoint" TEXT NOT NULL,
    "currentSolution" TEXT NOT NULL DEFAULT '',
    "willingnessToPay" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "CustomerInterview_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValidationExperiment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "experimentType" TEXT NOT NULL,
    "successMetric" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "ValidationExperiment_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketGap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" INTEGER NOT NULL DEFAULT 50,
    "opportunityScore" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "MarketGap_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customerSegment" TEXT NOT NULL DEFAULT '',
    "businessModel" TEXT NOT NULL DEFAULT '',
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "score" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchRunId" INTEGER NOT NULL,
    CONSTRAINT "Opportunity_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvidenceCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Task_projectId_idx" ON "Task"("projectId");

-- CreateIndex
CREATE INDEX "Report_projectId_idx" ON "Report"("projectId");

-- CreateIndex
CREATE INDEX "Note_projectId_idx" ON "Note"("projectId");

-- CreateIndex
CREATE INDEX "Memory_projectId_idx" ON "Memory"("projectId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "ResearchJob_projectId_idx" ON "ResearchJob"("projectId");

-- CreateIndex
CREATE INDEX "ResearchJob_status_idx" ON "ResearchJob"("status");

-- CreateIndex
CREATE INDEX "ResearchRun_researchJobId_idx" ON "ResearchRun"("researchJobId");

-- CreateIndex
CREATE INDEX "ResearchRun_status_idx" ON "ResearchRun"("status");

-- CreateIndex
CREATE INDEX "ResearchFinding_researchRunId_idx" ON "ResearchFinding"("researchRunId");

-- CreateIndex
CREATE INDEX "ResearchFinding_opportunityScore_idx" ON "ResearchFinding"("opportunityScore");

-- CreateIndex
CREATE INDEX "ResearchCluster_researchRunId_idx" ON "ResearchCluster"("researchRunId");

-- CreateIndex
CREATE INDEX "ResearchCluster_score_idx" ON "ResearchCluster"("score");

-- CreateIndex
CREATE INDEX "ResearchClusterFinding_findingId_idx" ON "ResearchClusterFinding"("findingId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchClusterFinding_clusterId_findingId_key" ON "ResearchClusterFinding"("clusterId", "findingId");

-- CreateIndex
CREATE INDEX "RootCause_researchRunId_idx" ON "RootCause"("researchRunId");

-- CreateIndex
CREATE INDEX "RootCause_parentId_idx" ON "RootCause"("parentId");

-- CreateIndex
CREATE INDEX "ResearchGraphNode_researchRunId_idx" ON "ResearchGraphNode"("researchRunId");

-- CreateIndex
CREATE INDEX "ResearchGraphNode_findingId_idx" ON "ResearchGraphNode"("findingId");

-- CreateIndex
CREATE INDEX "ResearchGraphEdge_fromNodeId_idx" ON "ResearchGraphEdge"("fromNodeId");

-- CreateIndex
CREATE INDEX "ResearchGraphEdge_toNodeId_idx" ON "ResearchGraphEdge"("toNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchGraphEdge_fromNodeId_toNodeId_relation_key" ON "ResearchGraphEdge"("fromNodeId", "toNodeId", "relation");

-- CreateIndex
CREATE INDEX "CompetitorSnapshot_researchRunId_idx" ON "CompetitorSnapshot"("researchRunId");

-- CreateIndex
CREATE INDEX "ResearchTrend_researchRunId_idx" ON "ResearchTrend"("researchRunId");

-- CreateIndex
CREATE INDEX "CustomerInterview_researchRunId_idx" ON "CustomerInterview"("researchRunId");

-- CreateIndex
CREATE INDEX "ValidationExperiment_researchRunId_idx" ON "ValidationExperiment"("researchRunId");

-- CreateIndex
CREATE INDEX "ValidationExperiment_status_idx" ON "ValidationExperiment"("status");

-- CreateIndex
CREATE INDEX "MarketGap_researchRunId_idx" ON "MarketGap"("researchRunId");

-- CreateIndex
CREATE INDEX "MarketGap_opportunityScore_idx" ON "MarketGap"("opportunityScore");

-- CreateIndex
CREATE INDEX "Opportunity_researchRunId_idx" ON "Opportunity"("researchRunId");

-- CreateIndex
CREATE INDEX "Opportunity_score_idx" ON "Opportunity"("score");

-- CreateIndex
CREATE UNIQUE INDEX "EvidenceCache_url_key" ON "EvidenceCache"("url");

