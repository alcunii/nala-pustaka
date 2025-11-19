/**
 * Knowledge Graph Service - Find relationships between manuscripts
 * Text-based output for educational exploration
 */

const logger = require('../utils/logger');
const db = require('../config/database');
const vectorDB = require('./vectorDB');
const embeddingService = require('./embeddingOpenAI');

class KnowledgeGraphService {
  constructor() {
    // No longer need Supabase client
  }


  /**
   * Find related manuscripts based on multiple criteria
   * Returns text-based relationship map for educational display
   */
  async findRelatedManuscripts(manuscriptId, manuscriptData) {
    try {
      logger.info(`Finding related manuscripts for: ${manuscriptId}`);

      // 1. Check pre-computed relationships first (fast)
      const precomputed = await this.getPrecomputedRelationships(manuscriptId);

      // 2. If no precomputed data, compute on-the-fly using vector similarity
      if (!precomputed || precomputed.length === 0) {
        logger.info('No precomputed relationships, computing on-the-fly...');
        const computed = await this.computeRelationships(manuscriptId, manuscriptData);
        return computed;
      }

      // 3. Format precomputed relationships for display
      return this.formatRelationships(precomputed);
    } catch (error) {
      logger.error('Knowledge graph error:', error);
      // GRACEFUL FALLBACK: Return empty relationships instead of throwing
      return {
        relatedManuscripts: [],
        sharedCharacters: [],
        similarThemes: [],
        timelinePeriod: manuscriptData?.year ? `Abad ${Math.floor(manuscriptData.year / 100) + 1}` : 'Tidak diketahui',
        error: 'Gagal memuat relasi untuk naskah ini'
      };
    }
  }

  /**
   * Get pre-computed relationships from database
   */
  async getPrecomputedRelationships(manuscriptId) {
    try {
      const query = `
        SELECT * FROM manuscript_relationships
        WHERE source_manuscript_id = $1
        ORDER BY strength DESC
        LIMIT 10
      `;
      const { rows } = await db.query(query, [manuscriptId]);
      return rows || [];
    } catch (error) {
      logger.warn(`Failed to get precomputed relationships for ${manuscriptId}:`, error.message);
      return [];
    }
  }


  /**
   * Compute relationships on-the-fly using vector similarity
   * (Fallback when no precomputed data exists)
   */
  async computeRelationships(manuscriptId, manuscriptData) {
    try {
      // Use manuscript title + description for similarity search
      const queryText = `${manuscriptData.title} ${manuscriptData.description || ''}`.trim();

      // Generate embedding for query
      const queryEmbedding = await embeddingService.generateEmbedding(queryText);

      // Search for similar manuscripts in Pinecone
      const results = await vectorDB.query(queryEmbedding, { topK: 10, minScore: 0.6 });

      // Filter out self-references and group by manuscript
      const manuscriptMap = new Map();
      for (const result of results) {
        const relatedId = result.metadata.manuscriptId;
        if (relatedId === manuscriptId) continue; // Skip self

        if (!manuscriptMap.has(relatedId) || manuscriptMap.get(relatedId).score < result.score) {
          manuscriptMap.set(relatedId, {
            manuscript_id: relatedId,
            title: result.metadata.title,
            author: result.metadata.author,
            similarity_score: result.score,
            reason: 'Kesamaan tema dan konten' // Generic reason
          });
        }
      }

      // Format for display
      const related = Array.from(manuscriptMap.values())
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 5);

      return {
        relatedManuscripts: related,
        sharedCharacters: [], // Not available without educational content
        similarThemes: ['Tema serupa berdasarkan analisis konten'],
        timelinePeriod: manuscriptData.year ? `Abad ${Math.floor(manuscriptData.year / 100) + 1}` : 'Tidak diketahui'
      };
    } catch (error) {
      logger.error('Compute relationships error:', error);
      return {
        relatedManuscripts: [],
        sharedCharacters: [],
        similarThemes: [],
        timelinePeriod: 'Tidak diketahui'
      };
    }
  }

  /**
   * Format precomputed relationships into structured display format
   */
  formatRelationships(relationships) {
    const grouped = {
      byCharacter: [],
      byTheme: [],
      byPeriod: [],
      byRegion: [],
      byAuthor: []
    };

    for (const rel of relationships) {
      const entry = {
        manuscript_id: rel.related_manuscript_id,
        relationship_data: rel.relationship_data,
        strength: rel.strength
      };

      switch (rel.relationship_type) {
        case 'character':
          grouped.byCharacter.push(entry);
          break;
        case 'theme':
          grouped.byTheme.push(entry);
          break;
        case 'period':
          grouped.byPeriod.push(entry);
          break;
        case 'region':
          grouped.byRegion.push(entry);
          break;
        case 'author':
          grouped.byAuthor.push(entry);
          break;
      }
    }

    return grouped;
  }

  /**
   * Build relationships from educational content
   * (To be called after generating educational content for all manuscripts)
   */
  async buildRelationshipsFromEducationalContent(manuscripts) {
    logger.info('Building relationships from educational content...');
    const relationships = [];

    // Get all educational content
    const query = 'SELECT manuscript_id, content_data FROM educational_content';
    const { rows: educationalData } = await db.query(query);

    if (!educationalData || educationalData.length === 0) {
      logger.warn('No educational content found');
      return;
    }

    // Build character relationships
    const characterMap = new Map(); // character_name -> [manuscript_ids]

    for (const edu of educationalData) {
      const characters = edu.content_data.characters || [];
      for (const char of characters) {
        const charName = char.nama;
        if (!characterMap.has(charName)) {
          characterMap.set(charName, []);
        }
        characterMap.get(charName).push(edu.manuscript_id);
      }
    }

    // Create relationships where characters appear in multiple manuscripts
    for (const [charName, manuscriptIds] of characterMap.entries()) {
      if (manuscriptIds.length > 1) {
        // Create bidirectional relationships
        for (let i = 0; i < manuscriptIds.length; i++) {
          for (let j = i + 1; j < manuscriptIds.length; j++) {
            relationships.push({
              source_manuscript_id: manuscriptIds[i],
              related_manuscript_id: manuscriptIds[j],
              relationship_type: 'character',
              relationship_data: { shared_character: charName },
              strength: 0.8
            });
            // Bidirectional
            relationships.push({
              source_manuscript_id: manuscriptIds[j],
              related_manuscript_id: manuscriptIds[i],
              relationship_type: 'character',
              relationship_data: { shared_character: charName },
              strength: 0.8
            });
          }
        }
      }
    }

    // Insert relationships into database
    if (relationships.length > 0) {
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        for (const rel of relationships) {
          const insertQuery = `
            INSERT INTO manuscript_relationships
            (source_manuscript_id, related_manuscript_id, relationship_type, relationship_data, strength)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (source_manuscript_id, related_manuscript_id, relationship_type)
            DO UPDATE SET
              relationship_data = EXCLUDED.relationship_data,
              strength = EXCLUDED.strength,
              updated_at = NOW()
          `;
          await client.query(insertQuery, [
            rel.source_manuscript_id,
            rel.related_manuscript_id,
            rel.relationship_type,
            JSON.stringify(rel.relationship_data),
            rel.strength
          ]);
        }

        await client.query('COMMIT');
        logger.info(`Successfully built ${relationships.length} relationships`);
      } catch (insertError) {
        await client.query('ROLLBACK');
        logger.error('Failed to insert relationships:', insertError);
        throw insertError;
      } finally {
        client.release();
      }
    }

    return relationships;
  }
}

// Singleton instance
const knowledgeGraphService = new KnowledgeGraphService();
module.exports = knowledgeGraphService;