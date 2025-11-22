const db = require("../config/database");
const { v4: uuidv4 } = require("uuid");
const educationalAIService = require("./educationalAI");
const logger = require("../utils/logger");

// Helper function to calculate content quality based on text length
function calculateContentQuality(fullText) {
  const length = fullText ? fullText.length : 0;
  if (length === 0) return "empty";
  if (length < 1000) return "very_short";
  if (length < 5000) return "short";
  if (length < 20000) return "medium";
  return "rich";
}

const manuscriptService = {
  async getAll() {
    // OPTIMIZED: List view WITHOUT full_text (untuk Catalog, Homepage)
    // Saves 95%+ network transfer!
    const query = `
      SELECT id, manuscript_id, title, author, year, description, slug, source_url,
             is_pinned, display_order, category, tags, content_quality, created_at, updated_at
      FROM manuscripts
      ORDER BY
        CASE content_quality
          WHEN 'rich' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'short' THEN 3
          WHEN 'very_short' THEN 4
          WHEN 'empty' THEN 5
          ELSE 6
        END,
        display_order ASC,
        created_at DESC
    `;
    const { rows } = await db.query(query);
    if (rows.length > 0) {
      logger.info(`[DEBUG] First manuscript fetched: ${rows[0].title}, Category: ${rows[0].category}, Tags: ${rows[0].tags}, Desc Len: ${rows[0].description?.length}`);
    }
    return rows;
  },

  // Get all manuscripts WITH full_text (for admin/special use only)
  async getAllWithFullText() {
    const query = `
      SELECT id, manuscript_id, title, author, year, description, slug, source_url, full_text,
             is_pinned, display_order, category, tags, content_quality, created_at, updated_at
      FROM manuscripts
      ORDER BY
        CASE content_quality
          WHEN 'rich' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'short' THEN 3
          WHEN 'very_short' THEN 4
          WHEN 'empty' THEN 5
          ELSE 6
        END,
        display_order ASC,
        created_at DESC
    `;
    const { rows } = await db.query(query);
    return rows;
  },

  async getBySlug(slug) {
    const query = "SELECT * FROM manuscripts WHERE slug = $1";
    const { rows } = await db.query(query, [slug]);
    return rows[0];
  },

  async getById(id) {
    const query = "SELECT * FROM manuscripts WHERE id = $1";
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  async create(manuscript) {
    let { title, author, year, description, slug, source_url, full_text, category, tags, created_by, knowledge_graph } = manuscript;
    
    // Check if slug exists
    const existing = await this.getBySlug(slug);
    if (existing) {
      throw new Error("Slug already exists");
    }

    // Auto-generate description if missing
    if ((!description || description.trim() === '') && full_text && full_text.length > 100) {
      try {
        logger.info(`Auto-generating description for new manuscript: ${title}`);
        const generatedDesc = await educationalAIService.generateCatalogDescription({ title, author, full_text });
        if (generatedDesc) {
          description = generatedDesc;
        }
      } catch (error) {
        logger.warn(`Failed to auto-generate description for ${title}:`, error.message);
      }
    }

    // Auto-generate tags if missing
    if ((!tags || tags.length === 0) && full_text && full_text.length > 100) {
      try {
        logger.info(`Auto-generating tags for new manuscript: ${title}`);
        const generatedTags = await educationalAIService.generateTags({ title, author, description, full_text });
        if (generatedTags && generatedTags.length > 0) {
          tags = generatedTags;
        } else {
          tags = ['other'];
        }
      } catch (error) {
        logger.warn(`Failed to auto-generate tags for ${title}:`, error.message);
        tags = ['other'];
      }
    }

    // Auto-assign category if missing or generic
    if ((!category || category === 'Lain-lain') && tags && tags.length > 0) {
      try {
        const determinedCategory = educationalAIService.determineCategory({ title, description }, tags);
        if (determinedCategory) {
          category = determinedCategory;
          logger.info(`Auto-assigned category for ${title}: ${category}`);
        }
      } catch (error) {
        logger.warn(`Failed to determine category for ${title}:`, error.message);
      }
    }

    // Get max display_order
    const orderQuery = "SELECT MAX(display_order) as max_order FROM manuscripts";
    const orderResult = await db.query(orderQuery);
    const display_order = (orderResult.rows[0].max_order || 0) + 1;

    // Calculate content quality automatically
    const content_quality = calculateContentQuality(full_text);

    const id = uuidv4();
    const query = "INSERT INTO manuscripts (id, title, author, year, description, slug, source_url, full_text, category, tags, created_by, display_order, knowledge_graph, content_quality, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()) RETURNING *";
    const values = [id, title, author, year, description, slug, source_url, full_text, category, tags, created_by, display_order, knowledge_graph, content_quality];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async update(id, updates) {
    const allowedColumns = ["title", "author", "year", "description", "slug", "source_url", "full_text", "category", "tags", "is_pinned", "display_order", "knowledge_graph"];
    const keys = Object.keys(updates).filter(key => allowedColumns.includes(key));
    
    if (keys.length === 0) return await this.getById(id);

    // If full_text is being updated, recalculate content_quality
    if (updates.full_text !== undefined) {
      updates.content_quality = calculateContentQuality(updates.full_text);
      keys.push("content_quality");
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(", ");
    const values = [id, ...keys.map(key => updates[key])];

    const query = `UPDATE manuscripts SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = "DELETE FROM manuscripts WHERE id = $1";
    await db.query(query, [id]);
    return { success: true };
  },

  async reorder(id1, id2) {
    const client = await db.getClient();
    try {
      await client.query("BEGIN");
      
      const { rows: [m1] } = await client.query("SELECT display_order FROM manuscripts WHERE id = $1", [id1]);
      const { rows: [m2] } = await client.query("SELECT display_order FROM manuscripts WHERE id = $1", [id2]);

      if (!m1 || !m2) throw new Error("One or both manuscripts not found");

      const order1 = m1.display_order || 0;
      const order2 = m2.display_order || 0;

      await client.query("UPDATE manuscripts SET display_order = $1 WHERE id = $2", [order2, id1]);
      await client.query("UPDATE manuscripts SET display_order = $1 WHERE id = $2", [order1, id2]);

      await client.query("COMMIT");
      return { success: true };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async togglePin(id) {
    const client = await db.getClient();
    try {
      await client.query("BEGIN");
      const { rows: [manuscript] } = await client.query("SELECT is_pinned FROM manuscripts WHERE id = $1", [id]);
      
      if (!manuscript) throw new Error("Manuscript not found");

      const newStatus = !manuscript.is_pinned;

      if (newStatus) {
        const { rows: [count] } = await client.query("SELECT COUNT(*) as count FROM manuscripts WHERE is_pinned = true");
        if (parseInt(count.count) >= 5) {
          throw new Error("Maksimal 5 naskah dapat di-pin.");
        }
      }

      const { rows: [updated] } = await client.query(
        "UPDATE manuscripts SET is_pinned = $1 WHERE id = $2 RETURNING *",
        [newStatus, id]
      );
      
      await client.query("COMMIT");
      return updated;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = manuscriptService;

