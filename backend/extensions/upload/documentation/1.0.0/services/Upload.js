
const path = require('path');


const generateFileName = name => {
    return name;
};

const { bytesToKbytes } = require('strapi-plugin-upload/utils/file');

module.exports = {
    formatFileInfo({ filename, type, size }, fileInfo = {}, metas = {}) {
      const ext = path.extname(filename);
      const basename = path.basename(fileInfo.name || filename, ext);
  
      const usedName = fileInfo.name || filename;
  
      const entity = {
        name: usedName,
        alternativeText: fileInfo.alternativeText,
        caption: fileInfo.caption,
        hash: generateFileName(basename),
        ext,
        mime: type,
        size: bytesToKbytes(size),
      };
  
      const { refId, ref, source, field } = metas;
  
      if (refId && ref && field) {
        entity.related = [
          {
            refId,
            ref,
            source,
            field,
          },
        ];
      }
  
      if (metas.path) {
        entity.path = metas.path;
      }
  
      return entity;
    },
}