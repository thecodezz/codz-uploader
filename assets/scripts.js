/**
 * CODz Drag & Drop File Uploader
 * A modern, flexible file upload component
 *
 * @author Ahmed Ali <https://github.com/thecodezz>
 * @copyright 2025 Ahmed Ali. All rights reserved.
 */

// Translations for UI text in English and Arabic
const uploaderTranslations = {
  en: {
    dragDropText: "Drag & drop {0} here",
    fileText: "a file",
    filesText: "files",
    acceptedTypesText: "Accepted types:",
    maxSizeText: "Max size:",
    selectFileText: "Select File",
    selectFilesText: "Select Files",
    dropFilesHereText: "Drop files here",
    previewFileText: "PREVIEW FILE",
    removeFileText: "Remove file",
    newUploaderText: "NEW UPLOADER",
    errorUnsupportedType: "Supported types is: {0}",
    errorMaxSize: "Maximum allowed size is: {0}MB",
    errorRequired: "{0} is required.",
    errorDeleteFile: "Unable to delete the file.",
    successDeleteFile: "File successfully deleted"
  },
  ar: {
    dragDropText: "اسحب وأفلت {0} هنا",
    fileText: "ملفًا",
    filesText: "ملفات",
    acceptedTypesText: "أنواع الملفات المقبولة:",
    maxSizeText: "الحجم الأقصى:",
    selectFileText: "اختر ملف",
    selectFilesText: "اختر ملفات",
    dropFilesHereText: "أفلت الملفات هنا",
    previewFileText: "معاينة الملف",
    removeFileText: "إزالة الملف",
    newUploaderText: "رفع جديد",
    errorUnsupportedType: "أنواع الملفات المدعومة: {0}",
    errorMaxSize: "الحجم الأقصى المسموح به: {0} ميجابايت",
    errorRequired: "{0} مطلوب.",
    errorDeleteFile: "تعذر حذف الملف.",
    successDeleteFile: "تم حذف الملف بنجاح"
  }
};

// Accept matcher function - improved implementation for wildcard MIME types and extensions with spaces
const createAcceptMatcher = (accept) => {
  if (!accept) return () => true;
  
  const acceptItems = accept.split(',')
    .map(item => item.trim())
    .filter(Boolean);
  
  const extensions = acceptItems.filter(item => item.startsWith('.')).map(ext => ext.toLowerCase());
  const mimeTypes = acceptItems.filter(item => !item.startsWith('.')).map(type => type.toLowerCase());
  
  return (file) => {
    try {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      if (extensions.length === 0 && mimeTypes.length === 0) {
        return true;
      }
      
      if (extensions.length > 0 && extensions.some(ext => fileName.endsWith(ext))) {
        return true;
      }
      
      // Check MIME type match (including wildcards)
      if (mimeTypes.length > 0) {
        for (const type of mimeTypes) {
          if (type.endsWith('/*')) {
            const baseType = type.slice(0, -1);
            if (fileType.startsWith(baseType)) {
              return true;
            }
          } else if (fileType === type) {
            return true;
          }
        }
      }
      
      return extensions.length === 0 && mimeTypes.length === 0;
    } catch (err) {
      console.error('Error in accept matcher:', err);
      return false;
    }
  };
};

class FileUploader {
  constructor(element) {
    this.element = element;
    this.config = {
      maxSize: parseInt(element.dataset.maxSize, 10) || 5120,
      acceptedTypes: element.dataset.acceptedTypes || '',
      singleMode: element.dataset.singleMode === 'true',
      existingFiles: element.dataset.existingFiles ? JSON.parse(element.dataset.existingFiles) : [],
      deleteMethod: element.dataset.deleteMethod || 'GET',
      required: element.dataset.required === 'true',
      name: element.dataset.name || '',
      lang: (element.dataset.lang || 'en').toLowerCase()
    };
    
    // Set default language to 'en' if invalid language is provided
    if (this.config.lang !== 'en' && this.config.lang !== 'ar') {
      this.config.lang = 'en';
    }
    
    // Set RTL (right-to-left) class and dir attribute for Arabic
    if (this.config.lang === 'ar') {
      this.element.classList.add('uploader-rtl');
      this.element.setAttribute('dir', 'rtl');
    }
    
    // Create accept matcher function
    this.acceptMatcher = createAcceptMatcher(this.config.acceptedTypes);

    this.icons = {
      upload: '<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>',
      file: '<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>',
      delete: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" fill="currentColor"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>',
      reset: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
      add: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>',
      previous: '<svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
      next: '<svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
      browse: '<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-.9V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
      spinner: '<svg viewBox="0 0 24 24" class="spin"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>',
      back: '<svg viewBox="0 0 24 24"><path d="M19 11H7.14l3.63-4.36a1 1 0 1 0-1.54-1.28l-5 6a1.19 1.19 0 0 0-.09.15c0 .05 0 .08-.07.13A1 1 0 0 0 4 12a1 1 0 0 0 .07.36c0 .05 0 .08.07.13a1.19 1.19 0 0 0 .09.15l5 6A1 1 0 0 0 10 19a1 1 0 0 0 .64-.23 1 1 0 0 0 .13-1.41L7.14 13H19a1 1 0 0 0 0-2z" fill="currentColor"/></svg>',
      eye: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/></svg>',
    };

    this.files = [];
    this.isDragging = false;
    this.carouselIndex = 0;
    this.fileInputs = [];
    this.hiddenInput = null;
    this.fileInputContainer = null;
    this.isArrayName = false;
    this.baseName = '';

    this.buildUploader();
    this.handleExistingFiles();
    this.setupEventListeners();
  }
  
  /**
   * Gets a translated string based on the current language setting
   * @param {string} key - The translation key
   * @param {...string} params - Parameters to replace placeholders in the translation
   * @returns {string} - The translated string
   */
  getTranslation(key, ...params) {
    const translations = uploaderTranslations[this.config.lang] || uploaderTranslations.en;
    let text = translations[key] || uploaderTranslations.en[key] || key;
    
    // Replace placeholders with parameters
    if (params && params.length) {
      params.forEach((param, index) => {
        text = text.replace(`{${index}}`, param);
      });
    }
    
    return text;
  }

  buildUploader() {
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'uploader-content';

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.className = 'uploader-input';
    this.fileInput.accept = this.config.acceptedTypes;
    this.fileInput.multiple = !this.config.singleMode;

    if (this.config.name) {
      this.fileInput.name = this.config.name;
    }

    const fileTypeText = this.config.singleMode ? 
      this.getTranslation('fileText') : 
      this.getTranslation('filesText');
      
    this.emptyStateElement = document.createElement('div');
    this.emptyStateElement.innerHTML = `
      <div class="uploader-icon">${this.icons.upload}</div>
      <div class="uploader-text">${this.getTranslation('dragDropText', fileTypeText)}</div>
      <div class="uploader-hint">
        ${this.getTranslation('acceptedTypesText')} ${this.formatAcceptedTypes()}
        <br>${this.getTranslation('maxSizeText')} ${this.formatMaxSize()}
      </div>
      <button type="button" class="uploader-browse">
        ${this.icons.browse} ${this.config.singleMode ? this.getTranslation('selectFileText') : this.getTranslation('selectFilesText')}
      </button>
    `;

    this.previewElement = document.createElement('div');
    this.previewElement.className = 'uploader-preview';
    this.previewElement.style.display = 'none';

    this.errorElement = document.createElement('div');
    this.errorElement.className = 'uploader-error';

    this.successElement = document.createElement('div');
    this.successElement.className = 'uploader-success';

    this.dropOverlay = document.createElement('div');
    this.dropOverlay.className = 'drop-overlay';
    this.dropOverlay.innerHTML = this.getTranslation('dropFilesHereText');
    this.element.appendChild(this.dropOverlay);

    this.contentElement.appendChild(this.emptyStateElement);
    this.element.appendChild(this.contentElement);
    this.element.appendChild(this.fileInput);
    this.element.appendChild(this.previewElement);
    this.element.appendChild(this.errorElement);
    this.element.appendChild(this.successElement);

    this.isArrayName = this.config.name.endsWith('[]');
    this.baseName = this.isArrayName ? this.config.name.slice(0, -2) : this.config.name;

    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'hidden';
    this.hiddenInput.name = this.isArrayName ? `${this.baseName}[]` : `${this.baseName}`;

    this.fileInputContainer = document.createElement('div');
    this.fileInputContainer.style.display = 'none';
    this.element.appendChild(this.fileInputContainer);
  }

  setupEventListeners() {
    this.element.addEventListener('dragover', this.handleDragOver.bind(this));
    this.element.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.element.addEventListener('drop', this.handleDrop.bind(this));

    this.element.querySelector('.uploader-browse').addEventListener('click', this.handleBrowseClick.bind(this));
    this.element.addEventListener('click', this.handleUploaderClick.bind(this));

    this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
  }

  handleExistingFiles() {
    try {
      if (this.config.existingFiles && this.config.existingFiles.length > 0) {
        if (this.config.singleMode && this.config.existingFiles.length > 0) {
          this.addExistingFile(this.config.existingFiles[0]);
        }
        else if (!this.config.singleMode) {
          this.config.existingFiles.forEach(fileObj => this.addExistingFile(fileObj));
        }

        this.updatePreview();
      }
    } catch (error) {
      console.error('Error handling existing files:', error);
    }
  }

  addExistingFile(fileObj) {
    try {
      if (!fileObj || !fileObj.url) {
        console.error('Invalid file object:', fileObj);
        return;
      }

      const existingFile = {
        id: fileObj.id,
        name: this.getFileNameFromUrl(fileObj.url),
        url: fileObj.url,
        deleteUrl: fileObj.deleteUrl,
        isExisting: true,
        type: this.getMimeTypeFromUrl(fileObj.url),
        size: 0
      };

      this.files.push(existingFile);
    } catch (error) {
      console.error('Error adding existing file:', error, fileObj);
    }
  }

  getMimeTypeFromUrl(url) {
    try {
      const extension = url.split('.').pop().toLowerCase();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'ogg': 'video/ogg',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'wmv': 'video/x-ms-wmv',
        'flv': 'video/x-flv',
        'mkv': 'video/x-matroska',
        'm4v': 'video/x-m4v',
        '3gp': 'video/3gpp',
        '3g2': 'video/3gpp2'
      };

      return mimeTypes[extension] || 'application/octet-stream';
    } catch (e) {
      return 'application/octet-stream';
    }
  }

  getFileNameFromUrl(url) {
    try {
      return url.split('/').pop().split('#')[0].split('?')[0] || 'file';
    } catch (e) {
      return 'file';
    }
  }

  formatAcceptedTypes() {
    if (!this.config.acceptedTypes) return this.getTranslation('filesText');
    
    return this.config.acceptedTypes
      .split(',')
      .map(type => type.trim())
      .join(', ');
  }

  formatMaxSize() {
    return `${(this.config.maxSize / 1024).toFixed(1)} MB`;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();

    if (this.files.length > 0) {
      this.dropOverlay.classList.add('active');
    }

    if (!this.isDragging) {
      this.isDragging = true;
      this.element.classList.add('drag-over');
    }
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    this.dropOverlay.classList.remove('active');

    this.isDragging = false;
    this.element.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    this.dropOverlay.classList.remove('active');

    this.isDragging = false;
    this.element.classList.remove('drag-over');

    if (e.dataTransfer.files.length > 0) {
      this.processFiles(e.dataTransfer.files);
    }
  }

  handleBrowseClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.fileInput.click();
  }

  handleUploaderClick(e) {
    if (e.target.closest('.control-button, .carousel-item-remove, .uploader-browse, .add-file-button, .carousel-nav')) {
      return;
    }

    if (this.files.length === 0 || e.target.closest('.add-file-button')) {
      this.fileInput.click();
    }
  }

  navigateCarousel(direction) {
    const totalItems = this.files.length + 1;
    const visibleItems = Math.floor(this.element.clientWidth / 108);

    if (direction === 'prev' && this.carouselIndex > 0) {
      this.carouselIndex--;
    } else if (direction === 'next' && this.carouselIndex < totalItems - visibleItems) {
      this.carouselIndex++;
    }

    this.updateCarouselPosition();
  }

  updateCarouselPosition() {
    const carousel = this.element.querySelector('.preview-carousel');
    if (!carousel) return;

    const translateX = -this.carouselIndex * 108;
    carousel.style.transform = `translateX(${translateX}px)`;

    const items = carousel.querySelectorAll('.uploader-carousel-item, .add-file-button');
    items.forEach((item, index) => {
      if (index < this.carouselIndex || index >= this.carouselIndex + 3) {
        item.classList.add('partial-visible');
      } else {
        item.classList.remove('partial-visible');
      }
    });
  }

  handleFileSelect(e) {
    if (this.fileInput.files.length > 0) {
      this.processFiles(this.fileInput.files);
    }
  }

  processFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    let validationFailed = false;

    const validFiles = files.filter(file => {
      if (!this.validateFileType(file)) {
        this.showError(`File type not accepted: ${file.type || this.getFileExtension(file)}`);
        validationFailed = true;
        return false;
      }

      if (!this.validateFileSize(file)) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        this.showError(`File too large: ${fileSizeMB}MB (max ${(this.config.maxSize / 1024).toFixed(1)}MB)`);
        validationFailed = true;
        return false;
      }

      return true;
    });

    if (validationFailed) {
      this.fileInput.value = '';
      return;
    }

    if (validFiles.length === 0) return;

    if (this.config.singleMode) {
      this.files = validFiles.map(file => ({
        ...file,
        isExisting: false,
        originalFile: file,
        name: file.name,
        type: file.type
      }));
    } else {
      const newFiles = validFiles.map(file => ({
        ...file,
        isExisting: false,
        originalFile: file,
        name: file.name,
        type: file.type
      }));

      this.files = [...newFiles, ...this.files];
    }

    this.updateFileInput();
    this.carouselIndex = 0;
    this.updatePreview();
  }

  updateFileInput() {
    const newFiles = this.files.filter(file => !file.isExisting);

    if (!this.fileInput || newFiles.length === 0) return;

    try {
      const dataTransfer = new DataTransfer();

      newFiles.forEach(file => {
        dataTransfer.items.add(file.originalFile);
      });

      this.fileInput.files = dataTransfer.files;
    } catch (error) {
      console.error('Error updating file input:', error);
    }
  }

  /**
   * Validates if a file's type is accepted based on configured accept attribute
   * @param {File} file - The file to validate
   * @returns {boolean} - Whether the file type is accepted
   */
  validateFileType(file) {
    if (!this.config.acceptedTypes) return true;
    return this.acceptMatcher(file);
  }

  validateFileSize(file) {
    return file.size <= this.config.maxSize * 1024;
  }

  showError(message) {
    if (this._errorTimeout) {
      clearTimeout(this._errorTimeout);
    }

    if (message.includes('File type not accepted')) {
      const acceptedTypes = this.formatAcceptedTypes();
      message = this.getTranslation('errorUnsupportedType', acceptedTypes);
    }
    else if (message.includes('File too large')) {
      const maxSize = (this.config.maxSize / 1024).toFixed(1);
      message = this.getTranslation('errorMaxSize', maxSize);
    }
    else if (message.includes('required')) {
      const field = message.replace(' is required', '');
      message = this.getTranslation('errorRequired', field.toLowerCase());
    }
    else if (message.includes('Error deleting')) {
      message = this.getTranslation('errorDeleteFile');
    }

    if (this.fileInput && (message.includes('not supported') || message.includes('exceeds'))) {
      this.fileInput.value = '';
    }

    this.errorElement.textContent = message;
    this.errorElement.classList.add('show');
    this.element.classList.add('uploader-error-state');

    this._errorTimeout = setTimeout(() => {
      this.errorElement.classList.remove('show');
      this.element.classList.remove('uploader-error-state');
    }, 3000);
  }

  showSuccess(message) {
    if (this._successTimeout) {
      clearTimeout(this._successTimeout);
    }

    // Use translated success message
    if (message.includes('File successfully deleted')) {
      message = this.getTranslation('successDeleteFile');
    }

    this.successElement.textContent = message;
    this.successElement.classList.add('show');
    this.element.classList.add('uploader-success-state');

    this._successTimeout = setTimeout(() => {
      this.successElement.classList.remove('show');
      this.element.classList.remove('uploader-success-state');
    }, 1000);
  }

  updatePreview() {
    if (this.files.length > 0) {
      this.element.classList.remove('uploader-error-state');
    }

    if (this.files.length === 0) {
      this.contentElement.style.display = 'flex';
      this.previewElement.style.display = 'none';
      return;
    }

    this.preparePreview();
    this.contentElement.style.display = 'none';
    this.previewElement.style.display = 'flex';
  }

  preparePreview() {
    this.previewElement.innerHTML = '';
    const previewContainer = document.createElement('div');
    previewContainer.className = this.config.singleMode ? 'single-preview' : 'preview-container';
    const editButton = document.createElement('button');
    editButton.className = 'uploader-edit-button';
    editButton.innerHTML = `${this.icons.upload} ${this.getTranslation('newUploaderText')}`;
    editButton.title = this.config.lang === 'ar' ? 'فتح أداة رفع جديدة' : 'Open New Uploader';
    editButton.addEventListener('click', this.handleReset.bind(this));

    if (this.config.singleMode) {
      this.createSingleFilePreview(previewContainer);
    } else {
      this.createCarouselPreview(previewContainer);
    }

    this.previewElement.appendChild(editButton);
    this.previewElement.appendChild(previewContainer);
  }

  createSingleFilePreview(container) {
    if (this.files.length === 0) return;

    const file = this.files[0];

    const item = document.createElement('div');
    item.className = 'single-preview-item';

    if (this.isImageFile(file)) {
      const img = document.createElement('img');

      if (file.isExisting) {
        img.src = file.url;
      } else {
        img.src = URL.createObjectURL(file.originalFile || file);

        img.onload = () => {
          URL.revokeObjectURL(img.src);
        };
      }

      img.onerror = () => {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTIxLjkgMjEuOUw2LjEgNi4xIDIuMSAyLjEgMC43IDMuNSAzLjMgNi4xIDEyIDZoOGMxLjEgMCAyIC45IDIgMnYxMGMwIC4yIDAgLjQtLjEuNmwyLjYgMi42IDEuNC0xLjR6TTQgMTZWOGMwLS4yIDAtLjQgLjEtLjZMOC45IDEyIDQgMTZ6bTUgMGw0LTQgMiAyLjV6Ii8+PC9zdmc+';
        item.classList.add('image-error');
      };

      item.appendChild(img);
    } else {
      const extension = this.getFileExtension(file);
      const normalizedExt = this.normalizeExtension(extension);
      const fileClass = `file-${normalizedExt}`;

      item.innerHTML = `
        <div class="file-extension ${fileClass}">${extension}</div>
      `;
    }

    if (file.isExisting && file.url) {
      item.classList.add('clickable-preview');

      const previewLabel = document.createElement('div');
      previewLabel.className = 'preview-label';
      previewLabel.innerHTML = `${this.icons.eye} ${this.getTranslation('previewFileText')}`;
      item.appendChild(previewLabel);

      item.addEventListener('click', (e) => {
        if (!e.target.closest('.carousel-item-remove')) {
          window.open(file.url, '_blank');
        }
      });
    }

    if (!file.isExisting || (file.isExisting && file.deleteUrl)) {
      const removeButton = this.createRemoveButton(0);
      item.appendChild(removeButton);
    }

    container.appendChild(item);
  }

  createCarouselPreview(container) {
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';
    carouselContainer.style.position = 'relative';

    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'carousel-wrapper';

    const carousel = document.createElement('div');
    carousel.className = 'preview-carousel';
    carousel.style.transform = 'translateX(0px)';

    const addButton = document.createElement('div');
    addButton.className = 'add-file-button';
    addButton.innerHTML = this.icons.add;
    addButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fileInput.click();
    });

    const carouselItems = [];

    this.files.forEach((file, index) => {
      if (!file) return;

      const item = document.createElement('div');
      item.className = 'uploader-carousel-item';

      if (this.isImageFile(file)) {
        const img = document.createElement('img');

        if (file.isExisting) {
          img.src = file.url;
        } else {
          img.src = URL.createObjectURL(file.originalFile || file);

          img.onload = () => {
            URL.revokeObjectURL(img.src);
          };
        }

        img.onerror = () => {
          img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NjYyI+PHBhdGggZD0iTTIxLjkgMjEuOUw2LjEgNi4xIDIuMSAyLjEgMC43IDMuNSAzLjMgNi4xIDEyIDZoOGMxLjEgMCAyIC45IDIgMnYxMGMwIC4yIDAgLjQtLjEuNmwyLjYgMi42IDEuNC0xLjR6TTQgMTZWOGMwLS4yIDAtLjQgLjEtLjZMOC45IDEyIDQgMTZ6bTUgMGw0LTQgMiAyLjV6Ii8+PC9zdmc+';
          item.classList.add('image-error');
        };

        item.appendChild(img);
      } else {
        const extension = this.getFileExtension(file);
        const normalizedExt = this.normalizeExtension(extension);
        const fileClass = `file-${normalizedExt}`;

        item.innerHTML = `
          <div class="file-extension ${fileClass}">${extension}</div>
        `;
      }

      if (file.isExisting && file.url) {
        item.classList.add('clickable-preview');

        const previewLabel = document.createElement('div');
        previewLabel.className = 'preview-label';
        previewLabel.innerHTML = `${this.icons.eye} ${this.getTranslation('previewFileText')}`;
        item.appendChild(previewLabel);

        item.addEventListener('click', (e) => {
          if (!e.target.closest('.carousel-item-remove')) {
            window.open(file.url, '_blank');
          }
        });
      }

      if (!file.isExisting || (file.isExisting && file.deleteUrl)) {
        const removeButton = this.createRemoveButton(index);
        item.appendChild(removeButton);
      }

      carouselItems.push(item);
    });

    carousel.appendChild(addButton);

    carouselItems.forEach(item => {
      carousel.appendChild(item);
    });

    carouselWrapper.appendChild(carousel);
    carouselContainer.appendChild(carouselWrapper);

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.className = 'carousel-nav carousel-prev';
    prevButton.innerHTML = this.icons.previous;
    prevButton.setAttribute('aria-label', this.config.lang === 'ar' ? 'الملفات السابقة' : 'Previous files');

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'carousel-nav carousel-next';
    nextButton.innerHTML = this.icons.next;
    nextButton.setAttribute('aria-label', this.config.lang === 'ar' ? 'الملفات التالية' : 'Next files');

    carouselContainer.appendChild(prevButton);
    carouselContainer.appendChild(nextButton);

    prevButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateCarousel(carousel, -1);
    });

    nextButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateCarousel(carousel, 1);
    });

    container.appendChild(carouselContainer);

    carousel.dataset.isAnimating = 'false';
    carousel.style.transition = 'none';
    carousel.style.transform = 'translateX(0px)';
  }

  navigateCarousel(carousel, direction) {
    if (carousel.dataset.isAnimating === 'true') {
      return;
    }

    carousel.dataset.isAnimating = 'true';

    const currentTransform = carousel.style.transform;
    let currentPosition = 0;

    if (currentTransform) {
      const match = currentTransform.match(/translateX\((-?\d+)px\)/);
      if (match && match[1]) {
        currentPosition = parseInt(match[1], 10);
      }
    }

    const itemWidth = 108;
    const visibleWidth = this.element.clientWidth - 20;

    const totalItems = this.files.length + 1;
    const maxScroll = Math.max(0, (totalItems * itemWidth) - visibleWidth);

    let newPosition = currentPosition;
    if (direction < 0) {
      newPosition = Math.min(0, currentPosition + itemWidth);
    } else {
      newPosition = Math.max(-maxScroll, currentPosition - itemWidth);
    }

    if (newPosition !== currentPosition) {
      carousel.setAttribute('style', `transition: transform 0.3s ease !important; transform: translateX(${newPosition}px) !important;`);

      carousel.dataset.position = newPosition;

      setTimeout(() => {
        carousel.setAttribute('style', `transform: translateX(${newPosition}px) !important;`);
        carousel.dataset.isAnimating = 'false';
      }, 350);
    } else {
      carousel.dataset.isAnimating = 'false';
    }
  }

  createRemoveButton(index) {
    const removeButton = document.createElement('button');
    removeButton.className = 'carousel-item-remove';
    removeButton.innerHTML = this.icons.delete;
    removeButton.title = this.getTranslation('removeFileText');

    removeButton.style.display = 'flex';
    removeButton.style.alignItems = 'center';
    removeButton.style.justifyContent = 'center';

    removeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.removeFile(index);
    });

    return removeButton;
  }

  handleReset(e) {
    e.preventDefault();
    e.stopPropagation();

    this.files.forEach(file => {
      if (file.isExisting && file.deleteUrl) {
        this.deleteFileViaAjax(file);
      }
    });

    this.files = [];
    this.carouselIndex = 0;

    this.fileInput.value = '';
    this.element.classList.remove('uploader-error-state');
    this.updatePreview();
  }

  /**
   * Gets the file extension display text based on file type
   * @param {File|Object} file - The file object to get extension for
   * @returns {string} - A display string representing the file type (PDF, XLS, etc.)
   */
  getFileExtension(file) {
    if (!file) return 'FILE';

    const excelMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.ms-excel.sheet.macroEnabled',
      'application/vnd.ms-excel.sheet.binary.macroEnabled',
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel.sheet.macroenabled.12'
    ];

    const wordMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.ms-word.document.macroEnabled',
      'application/rtf'
    ];

    const pptMimeTypes = [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',
      'application/vnd.ms-powerpoint.presentation.macroEnabled'
    ];

    const videoMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/x-flv',
      'video/x-matroska',
      'video/x-m4v',
      'video/3gpp',
      'video/3gpp2'
    ];

    if (file instanceof File || file.originalFile) {
        const name = file.name;
        const type = file.type;

        if (type) {
            if (type.includes('pdf')) return 'PDF';
            if (type.includes('image/')) return 'IMG';
            
            if (videoMimeTypes.some(mime => type.includes(mime)) ||
                type.includes('video/')) {
                return 'VID';
            }

            if (excelMimeTypes.some(mime => type.includes(mime)) ||
                type.includes('sheet') ||
                type.includes('excel') ||
                type.includes('spreadsheetml') ||
                type.includes('ms-excel')) {
                return 'XLS';
            }

            if (wordMimeTypes.some(mime => type.includes(mime)) ||
                type.includes('msword') ||
                type.includes('wordprocessingml')) {
                return 'DOC';
            }

            if (pptMimeTypes.some(mime => type.includes(mime)) ||
                type.includes('powerpoint') ||
                type.includes('presentation')) {
                return 'PPT';
            }

            if (type.includes('text/')) return 'TXT';
            if (type.includes('zip') || type.includes('compressed') || type.includes('archive')) return 'ZIP';
        }

        if (name) {
            const ext = name.split('.').pop().toLowerCase();

            if (['pdf'].includes(ext)) return 'PDF';
            if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'DOC';
            if (['xls', 'xlsx', 'xlsm', 'xlsb', 'csv', 'ods'].includes(ext)) return 'XLS';
            if (['ppt', 'pptx', 'pptm', 'odp'].includes(ext)) return 'PPT';
            if (['txt', 'text', 'md', 'markdown'].includes(ext)) return 'TXT';

            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ZIP';

            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'].includes(ext)) return 'IMG';
            if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v', '3gp', '3g2'].includes(ext)) return 'VID';
        }
    }

    if (file.url) {
        const ext = file.url.split('.').pop().toLowerCase().split(/[?#]/)[0];

        if (['pdf'].includes(ext)) return 'PDF';
        if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'DOC';
        if (['xls', 'xlsx', 'xlsm', 'xlsb', 'csv', 'ods'].includes(ext)) return 'XLS';
        if (['ppt', 'pptx', 'pptm', 'odp'].includes(ext)) return 'PPT';
        if (['txt', 'text', 'md', 'markdown'].includes(ext)) return 'TXT';
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'ZIP';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'].includes(ext)) return 'IMG';
        if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v', '3gp', '3g2'].includes(ext)) return 'VID';
    }

    return 'FILE';
  }

  /**
   * Normalizes file extension to map to the appropriate CSS class
   * @param {string} extension - The file extension/type (PDF, XLS, etc.)
   * @returns {string} - The normalized extension for CSS class
   */
  normalizeExtension(extension) {
    const upperExt = extension.toUpperCase();

    switch(upperExt) {
        case 'PDF': return 'pdf';
        case 'DOC': return 'doc';
        case 'XLS': return 'xls';
        case 'PPT': return 'ppt';
        case 'TXT': return 'txt';
        case 'ZIP': return 'zip';
        case 'IMG': return 'img';
        case 'VID': return 'vid';
        default: return 'default';
    }
  }

  isImageFile(file) {
    if (!file) return false;

    if (file.isExisting) {
      if (!file.url) return false;

      try {
        const ext = file.url.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      } catch (e) {
        console.warn('Error checking file extension:', e);
        return false;
      }
    }

    return file.type && typeof file.type === 'string' && file.type.startsWith('image/');
  }

  isVideoFile(file) {
    if (!file) return false;

    if (file.isExisting) {
      if (!file.url) return false;

      try {
        const ext = file.url.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'm4v', '3gp', '3g2'].includes(ext);
      } catch (e) {
        console.warn('Error checking file extension:', e);
        return false;
      }
    }

    return file.type && typeof file.type === 'string' && file.type.startsWith('video/');
  }

  removeFile(index) {
    const file = this.files[index];
    if (file.isExisting && file.deleteUrl) {
      this.deleteFileViaAjax(file, index);
      return;
    }

    this.files.splice(index, 1);

    if (this.carouselIndex >= this.files.length) {
      this.carouselIndex = Math.max(0, this.files.length - 1);
    }

    this.updatePreview();
    this.attachFilesToForm();

    if (this.files.length === 0 && this.fileInput) {
      this.fileInput.removeAttribute('name');
    }
  }

  deleteFileViaAjax(file, index) {
    const carouselItem = this.getCarouselItemByIndex(index);
    if (!carouselItem) return;

    const deleteButton = carouselItem.querySelector('.carousel-item-remove');
    if (deleteButton) {
      const originalButton = deleteButton.cloneNode(true);

      const spinnerButton = document.createElement('button');
      spinnerButton.className = 'carousel-item-remove spinner-active';
      spinnerButton.innerHTML = this.icons.spinner;
      spinnerButton.disabled = true;

      deleteButton.parentNode.replaceChild(spinnerButton, deleteButton);
    }

    const csrfToken = this.getCsrfToken();

    if (window.jQuery && typeof jQuery.ajax === 'function') {
      this.deleteWithJQuery(file, index, csrfToken, carouselItem);
    } else {
      this.deleteWithFetch(file, index, csrfToken, carouselItem);
    }
  }

  deleteWithJQuery(file, index, csrfToken, carouselItem) {
    const ajaxOptions = {
      url: file.deleteUrl,
      type: this.config.deleteMethod,
      dataType: 'json',
      success: (response) => {
        this.files.splice(index, 1);
        this.updatePreview();
        this.updateHiddenInputValue();
        this.showSuccess(this.getTranslation('successDeleteFile'));
      },
      error: (xhr, status, error) => {
        this.restoreDeleteButton(carouselItem, index);
        const errorMsg = xhr.responseJSON?.message || this.getTranslation('errorDeleteFile');
        this.showError(errorMsg);
      }
    };

    if (this.config.deleteMethod.toUpperCase() === 'DELETE' && csrfToken) {
      ajaxOptions.headers = {
        'X-CSRF-TOKEN': csrfToken
      };
    }

    jQuery.ajax(ajaxOptions);
  }

  deleteWithFetch(file, index, csrfToken, carouselItem) {
    const options = {
      method: this.config.deleteMethod,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (this.config.deleteMethod.toUpperCase() === 'DELETE' && csrfToken) {
      options.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    fetch(file.deleteUrl, options)
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || this.getTranslation('errorDeleteFile'));
          });
        }
        return response.json().catch(() => ({}));
      })
      .then(() => {
        this.files.splice(index, 1);
        this.updatePreview();
        this.updateHiddenInputValue();
        this.showSuccess(this.getTranslation('successDeleteFile'));
      })
      .catch(error => {
        this.restoreDeleteButton(carouselItem, index);
        this.showError(error.message || this.getTranslation('errorDeleteFile'));
      });
  }

  getCarouselItemByIndex(index) {
    if (this.config.singleMode) {
      return this.element.querySelector('.single-preview-item');
    } else {
      const items = this.element.querySelectorAll('.uploader-carousel-item');
      return items[index] || null;
    }
  }

  restoreDeleteButton(carouselItem, index) {
    const spinnerButton = carouselItem.querySelector('.carousel-item-remove.spinner-active');
    if (spinnerButton) {
      const newDeleteButton = this.createRemoveButton(index);
      spinnerButton.parentNode.replaceChild(newDeleteButton, spinnerButton);
    }
  }

  getCsrfToken() {
    const metaToken = document.querySelector('meta[name="csrf-token"]');
    if (metaToken) {
      return metaToken.getAttribute('content');
    }

    const tokenInput = document.querySelector('input[name="_token"]');
    if (tokenInput) {
      return tokenInput.value;
    }

    return null;
  }

  getFiles() {
    return this.files.map(file => file.originalFile || file);
  }

  getExistingFileIds() {
    return this.files
      .filter(file => file.isExisting)
      .map(file => file.id);
  }

  hasFiles() {
    return this.files.length > 0;
  }

  updateHiddenInputValue() {
    if (this.hiddenInput.parentNode) {
      this.hiddenInput.parentNode.removeChild(this.hiddenInput);
    }

    if (this.files.length === 0) {
      return;
    }

    const existingFileIds = this.files
      .filter(file => file.isExisting)
      .map(file => file.id);

    if (existingFileIds.length > 0) {
      if (this.config.singleMode) {
        const file = this.files[0];
        this.hiddenInput.value = file.isExisting ? file.id : '';
      } else {
        this.hiddenInput.value = JSON.stringify(existingFileIds);
      }
      this.element.appendChild(this.hiddenInput);
    }
  }

  prepareFilesForSubmission() {
    const form = this.findNearestForm();
    if (!form) return;

    const newFiles = this.files.filter(file => !file.isExisting);

    if (newFiles.length === 0) {
      if (this.fileInput) {
        this.fileInput.value = '';
        this.fileInput.removeAttribute('name');
      }
      return;
    }

    form.setAttribute('enctype', 'multipart/form-data');

    if (typeof FormData !== 'undefined') {
      if (!form._uploaderInitialized) {
        const originalSubmit = form.submit;

        form.addEventListener('submit', (e) => {
          if (form._isSubmitting) return;

          e.preventDefault();
          form._isSubmitting = true;

          const originalName = this.fileInput.name;
          this.fileInput.removeAttribute('name');

          const formData = new FormData(form);

          this.removeExistingFileInputs(form);

          if (newFiles.length > 0) {
            if (this.config.singleMode) {
              formData.append(this.config.name, newFiles[0].originalFile || newFiles[0]);
            } else {
              newFiles.forEach((file) => {
                formData.append(`${this.config.name}[]`, file.originalFile || file);
              });
            }
          }

          this.submitFormWithFormData(form, formData);

          if (originalName) {
            this.fileInput.name = originalName;
          }
        });

        form._uploaderInitialized = true;
      }
    } else {
      this.createFileInputsForSubmission(form, newFiles);
    }
  }

  attachFilesToForm() {
    try {
      this.fileInputContainer.innerHTML = '';
      this.fileInputs = [];

      const newFiles = this.files.filter(file => !file.isExisting);

      this.updateHiddenInputValue();

      if (newFiles.length === 0) {
        if (this.fileInput) {
          this.fileInput.value = '';
          this.fileInput.removeAttribute('name');
        }
        return;
      }

      if (this.fileInput && this.config.name) {
        this.fileInput.name = this.config.name;
      }

      const form = this.findNearestForm();
      if (form) {
        form.setAttribute('enctype', 'multipart/form-data');
      }

      if (this.config.singleMode) {
        const input = this.createFileInputWithFile(newFiles[0].originalFile, this.config.name);
        this.fileInputs.push(input);
        this.fileInputContainer.appendChild(input);
      } else {
        const inputName = this.isArrayName ? this.config.name : `${this.config.name}[]`;
        newFiles.forEach(file => {
          const input = this.createFileInputWithFile(file.originalFile, inputName);
          this.fileInputs.push(input);
          this.fileInputContainer.appendChild(input);
        });
      }
    } catch (error) {
      console.error('Error attaching files to form:', error);
    }
  }

  createFileInputWithFile(file, name) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const input = document.createElement('input');
    input.type = 'file';
    input.name = name;
    input.style.display = 'none';

    input.files = dataTransfer.files;

    return input;
  }

  findNearestForm() {
    let currentElement = this.element;
    while (currentElement && currentElement !== document) {
      if (currentElement.tagName === 'FORM') {
        return currentElement;
      }
      currentElement = currentElement.parentElement;
    }
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const uploaders = document.querySelectorAll('.file-uploader');
  uploaders.forEach(element => {
    try {
      element._uploader = new FileUploader(element);
    } catch (error) {
      console.error('Error initializing uploader:', error);
    }
  });

  setupFormValidation();
});

function setupFormValidation() {
    document.addEventListener('submit', function(e) {
        if (!e.target.matches('form')) return;

        const form = e.target;
        const requiredUploaders = form.querySelectorAll('.file-uploader[data-required="true"]');

        if (requiredUploaders.length === 0) return;

        let hasError = false;

        requiredUploaders.forEach(function(uploaderElement) {
            const uploader = uploaderElement._uploader;

            if (!uploader) return;

            const newFiles = uploader.files.filter(file => !file.isExisting);
            const hasNewFiles = newFiles.length > 0;

            if (!hasNewFiles) {
                hasError = true;
                uploaderElement.classList.add('uploader-error-state');

                const fieldName = uploader.config.name || 'File';
                const cleanFieldName = fieldName
                    .replace(/\[\]$/, '')
                    .replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');

                uploader.showError(`${cleanFieldName} is required`);

                if (!e._scrolled) {
                    e._scrolled = true;
                    uploaderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                uploaderElement.classList.remove('uploader-error-state');
            }
        });

        if (hasError) {
            e.preventDefault();
            return false;
        }

        return true;
    });

    document.addEventListener('change', function(e) {
        if (!e.target.matches('.file-uploader[data-required="true"] input[type="file"]')) return;

        const uploaderElement = e.target.closest('.file-uploader');
        const uploader = uploaderElement._uploader;

        if (uploader) {
            const hasNewFiles = uploader.files.some(file => !file.isExisting);
            if (hasNewFiles) {
                uploaderElement.classList.remove('uploader-error-state');
            }
        }
    });
}
