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
   * Get knowledge graph nodes and edges for a specific manuscript
   * Returns D3.js-compatible format for visualization
   */
  async getGraphByManuscript(manuscriptId) {
    try {
      logger.info(`🔍 Getting knowledge graph for manuscript: ${manuscriptId}`);

      // 🔍 DEBUG: Verify manuscript exists
      const manuscriptCheck = await db.query(
        'SELECT id, title FROM manuscripts WHERE id = $1',
        [manuscriptId]
      );
      
      if (manuscriptCheck.rows.length === 0) {
        logger.warn(`⚠️ Manuscript not found: ${manuscriptId}`);
        return { nodes: [], links: [], error: 'Manuscript not found' };
      }
      
      logger.info(`✅ Found manuscript: ${manuscriptCheck.rows[0].title}`);

      // Get all nodes connected to this manuscript
      const nodesQuery = `
        SELECT 
          kn.id, 
          kn.label, 
          kn.type, 
          kn.description,
          kn.importance,
          kn.source_count
        FROM knowledge_nodes kn
        WHERE EXISTS (
          SELECT 1 FROM knowledge_edges ke 
          WHERE ke.manuscript_id = $1 
          AND (ke.source_id = kn.id OR ke.target_id = kn.id)
        )
        ORDER BY 
          CASE WHEN kn.importance = 'high' THEN 1 
               WHEN kn.importance = 'medium' THEN 2 
               ELSE 3 END,
          kn.source_count DESC
      `;
      
      const { rows: nodes } = await db.query(nodesQuery, [manuscriptId]);
      
      // 🔍 DEBUG: Log query result
      logger.info(`📊 Query returned ${nodes.length} nodes for manuscript ${manuscriptId}`);
      
      if (nodes.length === 0) {
        return { nodes: [], links: [], message: 'No knowledge graph data for this manuscript' };
      }

      // Get all edges for this manuscript
      const edgesQuery = `
        SELECT 
          ke.id,
          src.id as source_id,
          src.label as source,
          tgt.id as target_id,
          tgt.label as target,
          ke.relation_type,
          ke.description,
          ke.weight
        FROM knowledge_edges ke
        JOIN knowledge_nodes src ON src.id = ke.source_id
        JOIN knowledge_nodes tgt ON tgt.id = ke.target_id
        WHERE ke.manuscript_id = $1
      `;
      
      const { rows: edges } = await db.query(edgesQuery, [manuscriptId]);
      
      // Create node ID map for D3.js indexing
      const nodeIdMap = new Map();
      nodes.forEach((n, index) => {
        nodeIdMap.set(n.id, index);
      });

      // Format for D3.js visualization
      const graph = {
        nodes: nodes.map(n => ({
          id: n.id,
          label: n.label,
          type: n.type,
          description: n.description || '',
          importance: n.importance || 'medium',
          group: this.getNodeGroup(n.type),
          size: this.getNodeSize(n.type, n.importance)
        })),
        links: edges.map(e => ({
          source: nodeIdMap.get(e.source_id),
          target: nodeIdMap.get(e.target_id),
          label: e.relation_type,
          description: e.description || '',
          value: parseFloat(e.weight) || 0.5
        })).filter(l => l.source !== undefined && l.target !== undefined)
      };
      
      logger.info(`Found ${graph.nodes.length} nodes and ${graph.links.length} links`);
      return graph;
      
    } catch (error) {
      logger.error('Error getting knowledge graph:', error);
      return { nodes: [], links: [], error: error.message };
    }
  }

  /**
   * Helper: Get node group for visualization coloring
   */
  getNodeGroup(type) {
    const groupMap = {
      'VALUE': 1,      // Gold/Brown for values
      'PERSON': 2,     // Blue for persons
      'LOCATION': 3,   // Green for locations
      'CONCEPT': 4,    // Purple for concepts
      'ARTIFACT': 5,   // Orange for artifacts
      'EVENT': 6       // Red for events
    };
    return groupMap[type] || 0;
  }

  /**
   * Helper: Get node size based on type and importance
   */
  getNodeSize(type, importance) {
    const baseSize = type === 'VALUE' ? 12 : 8;
    const importanceMultiplier = {
      'high': 1.5,
      'medium': 1.0,
      'low': 0.75
    };
    return baseSize * (importanceMultiplier[importance] || 1.0);
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