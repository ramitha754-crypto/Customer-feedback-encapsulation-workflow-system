$files = Get-ChildItem -Path 'c:\Users\ramit\OneDrive\Desktop\proj1\Customer-feedback-encapsulation-workflow-system\frontend\src\components' -Recurse -Filter '*.tsx'

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    # Text colors
    $content = $content -replace "color: '#fafafa'", "color: 'var(--text-primary)'"
    $content = $content -replace "color: '#a1a1aa'", "color: 'var(--text-secondary)'"
    $content = $content -replace "color: '#71717a'", "color: 'var(--text-muted)'"
    $content = $content -replace "color: '#52525b'", "color: 'var(--text-dim)'"
    $content = $content -replace "color: '#09090b'", "color: 'var(--text-inverse)'"

    # Background colors
    $content = $content -replace "backgroundColor: '#09090b'", "backgroundColor: 'var(--bg-dark)'"
    $content = $content -replace "backgroundColor: '#121215'", "backgroundColor: 'var(--bg-card)'"
    $content = $content -replace "backgroundColor: '#18181b'", "backgroundColor: 'var(--bg-card-hover)'"
    $content = $content -replace "backgroundColor: '#27272a'", "backgroundColor: 'var(--bg-card-active)'"
    $content = $content -replace "background: '#09090b'", "background: 'var(--bg-dark)'"
    $content = $content -replace "background: '#121215'", "background: 'var(--bg-card)'"

    # Border colors
    $content = $content -replace "borderColor: '#fafafa'", "borderColor: 'var(--text-primary)'"
    $content = $content -replace "border: '1px solid #ffffff'", "border: '1px solid var(--text-primary)'"
    $content = $content -replace "borderBottom: '2px solid #fafafa'", "borderBottom: '2px solid var(--text-primary)'"

    if ($content -ne $original) {
        Set-Content $file.FullName -Value $content -NoNewline
        Write-Host ("Updated: " + $file.Name)
    }
}
