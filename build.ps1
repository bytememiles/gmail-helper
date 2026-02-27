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

function Write-PngIconFromJpg {
  param(
    [Parameter(Mandatory=$true)][string]$JpgPath,
    [Parameter(Mandatory=$true)][string]$PngPath,
    [Parameter(Mandatory=$true)][int]$Size
  )

  Add-Type -AssemblyName System.Drawing
  $img = $null
  $bmp = $null
  $g = $null
  try {
    $img = [System.Drawing.Image]::FromFile($JpgPath)
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($img, 0, 0, $Size, $Size)
    $bmp.Save($PngPath, [System.Drawing.Imaging.ImageFormat]::Png) | Out-Null
  } finally {
    if ($g) { $g.Dispose() }
    if ($bmp) { $bmp.Dispose() }
    if ($img) { $img.Dispose() }
  }
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

# Generate PNG icons from assets/logo/greenhouse.jpg -> build/icons/icon{16,48,128}.png
New-Item -ItemType Directory -Path $BuildIconsDir -Force | Out-Null
if (Test-Path $AssetsLogo) {
  Write-PngIconFromJpg -JpgPath $AssetsLogo -PngPath (Join-Path $BuildIconsDir "icon16.png") -Size 16
  Write-PngIconFromJpg -JpgPath $AssetsLogo -PngPath (Join-Path $BuildIconsDir "icon48.png") -Size 48
  Write-PngIconFromJpg -JpgPath $AssetsLogo -PngPath (Join-Path $BuildIconsDir "icon128.png") -Size 128
  Write-Host "Icons generated in build/icons (icon16.png, icon48.png, icon128.png)"
} else {
  Write-Warning "Icon not found: $AssetsLogo - extension will load without custom icon. Add assets/logo/greenhouse.jpg and rebuild."
}

Write-Host "Build complete. Load the 'build' folder as an unpacked extension in chrome://extensions"
