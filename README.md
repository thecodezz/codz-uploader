<div align="center">
  <div style="display: flex; align-items: center; justify-content: center;">
    <img width="70" src="imgs/codz-logo.png" alt="CODz Uploader Logo">
    <h1 style="margin-left: 10px;">Drag & Drop Uploader</h1>
  </div>

  <p>
    <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
    <img src="https://img.shields.io/badge/author-Ahmed%20Ali-orange.svg" alt="Author">
  </p>

  <h2>A modern, flexible file upload component</h2>
</div>

## Features

- 🖱️ **Drag & Drop Interface** - Intuitive drag and drop functionality
- 📁 **Single & Multiple File Support** - Flexible upload configurations
- 🖼️ **File Preview** - Visual previews for images and file type indicators
- 📋 **File Type Validation** - Built-in validation for file types
- 📏 **File Size Limits** - Customizable file size restrictions
- 🔄 **Existing Files Management** - Manage and delete existing files
- 🔍 **Responsive Design** - Fully responsive across all device sizes
- 🎨 **Customizable UI** - Easy to customize appearance
- ⚙️ **Framework Agnostic** - Works with any JavaScript framework
- 🧩 **Blade Component** - Ready-to-use Laravel Blade component

## Installation

### Basic Installation

1. Include the CSS in your `<head>`:

```html
<link rel="stylesheet" href="assets/styles.css">
```

2. Include the JavaScript before the closing `</body>`:

```html
<script src="assets/scripts.js"></script>
```

3. Add the HTML markup:

```html
<div class="file-uploader" 
     data-max-size="5120" 
     data-accepted-types=".jpg,.png,.pdf"
     data-single-mode="true">
</div>
```

### Laravel Integration

If you're using Laravel, you can use the included Blade component using any of these syntaxes:

```php
<!-- Using Blade Component Tag Syntax (Laravel 7+) -->
<x-uploader
    name="document"
    label="Upload Document"
    :multiple="false"
    :required="true"
    accept=".pdf,.docx"
    maxSize="5120"
    deleteRouteName="files.delete"
/>

<!-- Using Blade Component Directive -->
@component('components.uploader', [
    'name' => 'document',
    'label' => 'Upload Document',
    'multiple' => false,
    'required' => true,
    'accept' => '.pdf,.docx',
    'maxSize' => '5120',
    'deleteRouteName' => 'files.delete'
])
@endcomponent
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data-max-size` | Number | 5120 | Maximum file size in KB |
| `data-accepted-types` | String | '' | Comma-separated list of accepted file types |
| `data-single-mode` | Boolean | false | Whether to allow only a single file upload |
| `data-existing-files` | JSON | [] | Array of existing files with ID and URL |
| `data-delete-method` | String | 'GET' | HTTP method for delete requests |
| `data-required` | Boolean | false | Whether file upload is required |
| `data-name` | String | '' | Name attribute for form submission |

## Usage Examples

### Single File Uploader

```html
<div class="file-uploader" 
     data-max-size="500" 
     data-accepted-types=".xlsx,.docx,.pdf"
     data-single-mode="true">
</div>
```

### Multiple File Uploader with Existing Files

```html
<div class="file-uploader" 
     data-max-size="500" 
     data-accepted-types="image/jpeg,image/png,application/pdf"
     data-single-mode="false"
     data-existing-files='[
         {"id": "1", "url": "https://example.com/file1.jpg", "deleteUrl": "/delete/1"},
         {"id": "2", "url": "https://example.com/file2.jpg", "deleteUrl": "/delete/2"}
     ]'
     data-delete-method="DELETE">
</div>
```

### Required File Upload in a Form

```html
<div class="file-uploader" 
     data-max-size="500" 
     data-accepted-types=".png,.jpg,.jpeg"
     data-single-mode="true"
     data-required="true"
     data-name="profile_image">
</div>
<button type="submit">Submit</button>
```

## Events & Methods

The uploader exposes several methods that you can use:

```javascript
// Access the uploader instance
const uploaderElement = document.querySelector('.file-uploader');
const uploader = uploaderElement._uploader;

// Check if there are files
uploader.hasFiles();

// Get all files (including File objects)
uploader.getFiles();

// Get existing file IDs
uploader.getExistingFileIds();
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## License

MIT License

## Author

Created by [Ahmed Ali](https://github.com/AhmedaliMo7amed)

---

<p align="center">
  <sub>Made with ❤️ by Ahmed Ali</sub>
</p>
