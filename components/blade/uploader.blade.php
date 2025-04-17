@props([
    'id' => uniqid('uploader-'),
    'name' => 'image',
    'label' => 'Browse Files',
    'multiple' => false,
    'hasLabel' => true,
    'required' => false,
    'accept' => '.png, .jpg, .jpeg',
    'maxSize' => '500',
    'files' => [],
    'deleteRouteName' => null,
    'deleteMethod' => 'GET',
])

@php
    $existingFiles = [];
    if (!empty($files)) {
        if (is_string($files)) {
            $fileId = uniqid();
            $existingFiles[] = [
                'id' => $fileId,
                'url' => $files,
                'deleteUrl' => $deleteRouteName ? route($deleteRouteName, $fileId) : null
            ];
        } elseif (is_array($files)) {
            foreach ($files as $id => $url) {
                if (is_numeric($id) || is_string($id)) {
                    $existingFiles[] = [
                        'id' => $id,
                        'url' => $url,
                        'deleteUrl' => $deleteRouteName ? route($deleteRouteName, $id) : null
                    ];
                }
            }
        }
    }
    $hasFiles = !empty($existingFiles);
    $existingFilesJson = !empty($existingFiles) ? json_encode($existingFiles) : '[]';
@endphp

<!-- Multi File Uploader -->
<div class="file-uploader-wrapper form-group">
    @if ($hasLabel)
        <label class="form-label">{{ $label }}</label>
    @endif
    <div class="file-uploader" id="{{ $id }}" 
        data-name="{{ $name }}"
        data-single-mode="{{ $multiple ? 'false' : 'true' }}" 
        data-max-size="{{ $maxSize }}"
        data-accepted-types="{{ $accept }}"
        data-required="{{ $required ? 'true' : 'false' }}"
        @if($hasFiles) 
        data-delete-method="{{ $deleteMethod }}"
        data-existing-files='{{ $existingFilesJson }}' 
        @endif
        >
    </div>
</div>
