ALTER TABLE "sessions" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
CREATE INDEX "sessions_embedding_idx" ON "sessions" USING hnsw ("embedding" vector_cosine_ops);