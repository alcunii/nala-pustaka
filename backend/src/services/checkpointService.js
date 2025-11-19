/**
 * Checkpoint Service
 * Save and load pipeline state to resume from any phase
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class CheckpointService {
  constructor() {
    this.checkpointDir = path.join(__dirname, '../../../checkpoints');
    this.ensureCheckpointDir();
  }

  ensureCheckpointDir() {
    if (!fs.existsSync(this.checkpointDir)) {
      fs.mkdirSync(this.checkpointDir, { recursive: true });
      logger.info(`?? Created checkpoint directory: ${this.checkpointDir}`);
    }
  }

  getCheckpointPath(phase) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return path.join(this.checkpointDir, `phase-${phase}-${timestamp}.json`);
  }

  getLatestCheckpoint(phase) {
    const files = fs.readdirSync(this.checkpointDir)
      .filter(f => f.startsWith(`phase-${phase}-`))
      .sort()
      .reverse();
    
    return files.length > 0 
      ? path.join(this.checkpointDir, files[0])
      : null;
  }

  async save(phase, data, metadata = {}) {
    try {
      const checkpointPath = this.getCheckpointPath(phase);
      
      const checkpoint = {
        phase,
        timestamp: new Date().toISOString(),
        metadata,
        data
      };

      fs.writeFileSync(
        checkpointPath, 
        JSON.stringify(checkpoint, null, 2),
        'utf8'
      );

      const fileSizeMB = (fs.statSync(checkpointPath).size / (1024 * 1024)).toFixed(2);
      logger.info(`?? Checkpoint saved: Phase ${phase} (${fileSizeMB} MB)`);
      logger.info(`   ?? ${checkpointPath}`);

      return checkpointPath;
    } catch (error) {
      logger.error(`? Error saving checkpoint for phase ${phase}:`, error);
      throw error;
    }
  }

  async load(phase) {
    try {
      const checkpointPath = this.getLatestCheckpoint(phase);
      
      if (!checkpointPath) {
        logger.warn(`??  No checkpoint found for phase ${phase}`);
        return null;
      }

      logger.info(`?? Loading checkpoint: ${checkpointPath}`);
      const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
      
      logger.info(`? Loaded checkpoint from ${checkpoint.timestamp}`);
      logger.info(`   Phase: ${checkpoint.phase}`);
      if (checkpoint.metadata) {
        logger.info(`   Metadata:`, checkpoint.metadata);
      }

      return checkpoint.data;
    } catch (error) {
      logger.error(`? Error loading checkpoint for phase ${phase}:`, error);
      throw error;
    }
  }

  listCheckpoints() {
    const files = fs.readdirSync(this.checkpointDir)
      .filter(f => f.startsWith('phase-'))
      .map(f => {
        const filePath = path.join(this.checkpointDir, f);
        const stats = fs.statSync(filePath);
        const match = f.match(/phase-(\d+)-(.+)\.json/);
        
        return {
          phase: match ? parseInt(match[1]) : null,
          filename: f,
          path: filePath,
          size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    return files;
  }

  clearCheckpoints(keepLatest = 1) {
    try {
      const files = this.listCheckpoints();
      const phases = [...new Set(files.map(f => f.phase))];

      let deletedCount = 0;

      phases.forEach(phase => {
        const phaseFiles = files.filter(f => f.phase === phase);
        const toDelete = phaseFiles.slice(keepLatest);

        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
          deletedCount++;
          logger.info(`???  Deleted old checkpoint: ${file.filename}`);
        });
      });

      logger.info(`? Cleared ${deletedCount} old checkpoints`);
      return deletedCount;
    } catch (error) {
      logger.error('? Error clearing checkpoints:', error);
      throw error;
    }
  }

  clearAll() {
    try {
      const files = this.listCheckpoints();
      files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      logger.info(`? Deleted all ${files.length} checkpoints`);
      return files.length;
    } catch (error) {
      logger.error('? Error clearing all checkpoints:', error);
      throw error;
    }
  }
}

module.exports = new CheckpointService();
