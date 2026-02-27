# Build script: copy src to build/ and add icon from assets/logo/greenhouse.jpg
# Run from project root (e.g. via build.bat)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$SrcDir = Join-Path $ProjectRoot "src"
$BuildDir = Join-Path $ProjectRoot "build"
$AssetsLogo = Join-Path (Join-Path (Join-Path $ProjectRoot "assets") "logo") "greenhouse.jpg"
$BuildIconsDir = Join-Path $BuildDir "icons"

if (-not (Test-Path $SrcDir)) {
  Write-Error "Source directory not found: $SrcDir"
}

# Clean and create build directory
if (Test-Path $BuildDir) {
  Remove-Item -Path $BuildDir -Recurse -Force
}
New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null

# Copy extension source (exclude refs - reference only)
$copyItems = @(
  @{ Path = "manifest.json"; IsFile = $true },
  @{ Path = "background.js"; IsFile = $true },
  @{ Path = "popup"; IsFile = $false },
  @{ Path = "options"; IsFile = $false },
  @{ Path = "offscreen"; IsFile = $false },
  @{ Path = "inject"; IsFile = $false }
)

foreach ($item in $copyItems) {
  $srcPath = Join-Path $SrcDir $item.Path
  if (-not (Test-Path $srcPath)) {
    Write-Error "Missing source: $srcPath"
  }
  $destPath = Join-Path $BuildDir $item.Path
  if ($item.IsFile) {
    Copy-Item -Path $srcPath -Destination $destPath -Force
  } else {
    Copy-Item -Path $srcPath -Destination $BuildDir -Recurse -Force
  }
}

# Copy icon: assets/logo/greenhouse.jpg -> build/icons/icon.jpg
New-Item -ItemType Directory -Path $BuildIconsDir -Force | Out-Null
if (Test-Path $AssetsLogo) {
  Copy-Item -Path $AssetsLogo -Destination (Join-Path $BuildIconsDir "icon.jpg") -Force
  Write-Host "Icon copied to build/icons/icon.jpg"
} else {
  Write-Warning "Icon not found: $AssetsLogo - extension will load without custom icon. Add assets/logo/greenhouse.jpg and rebuild."
}

Write-Host "Build complete. Load the 'build' folder as an unpacked extension in chrome://extensions"
