[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$ArchivePath = (Join-Path $env:USERPROFILE 'Downloads\helvetica-255.zip')
)

$ErrorActionPreference = 'Stop'

if ($env:OS -ne 'Windows_NT') {
    throw 'Este instalador requiere Windows.'
}
if (-not (Test-Path -LiteralPath $ArchivePath -PathType Leaf)) {
    throw "No se encuentra el ZIP: $ArchivePath. Usa -ArchivePath para indicar tu archivo local de Helvetica."
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
if (-not ('Nexo.FontInstaller' -as [type])) {
    Add-Type @'
using System;
using System.Runtime.InteropServices;
namespace Nexo {
    public static class FontInstaller {
        [DllImport("gdi32.dll", CharSet = CharSet.Unicode)]
        public static extern int AddFontResourceEx(string path, uint flags, IntPtr reserved);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        public static extern IntPtr SendMessageTimeout(IntPtr window, uint message,
            UIntPtr wparam, IntPtr lparam, uint flags, uint timeout, out UIntPtr result);
    }
}
'@
}

$fontRoot = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
$registryPath = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
$fontNames = @{
    'Helvetica.ttf' = 'Helvetica Regular'
    'Helvetica-Bold.ttf' = 'Helvetica Bold'
    'Helvetica-Oblique.ttf' = 'Helvetica Oblique'
    'Helvetica-BoldOblique.ttf' = 'Helvetica Bold Oblique'
    'helvetica-light-587ebe5a59211.ttf' = 'Helvetica Light Regular'
    'helvetica-compressed-5871d14b6903a.otf' = 'Helvetica Compressed Regular'
    'helvetica-rounded-bold-5871d05ead8de.otf' = 'Helvetica Rounded Bold'
}
$archive = [IO.Compression.ZipFile]::OpenRead((Resolve-Path -LiteralPath $ArchivePath).Path)
$installed = 0

try {
    $entries = @($archive.Entries | Where-Object { $_.Name -and $fontNames.ContainsKey($_.Name) })
    if ($entries.Count -eq 0) {
        throw 'El ZIP no contiene archivos reconocidos del pack helvetica-255.'
    }
    $duplicates = $entries | Group-Object Name | Where-Object Count -gt 1
    if ($duplicates) {
        throw 'El ZIP contiene nombres de fuentes duplicados.'
    }

    # Check the entire pack before writing so a conflicting version stays untouched.
    foreach ($entry in $entries) {
        $target = Join-Path $fontRoot $entry.Name
        if (Test-Path -LiteralPath $target) {
            $stream = $entry.Open()
            $sha = [Security.Cryptography.SHA256]::Create()
            try {
                $sourceHash = [BitConverter]::ToString($sha.ComputeHash($stream))
                $targetHash = [BitConverter]::ToString($sha.ComputeHash([IO.File]::ReadAllBytes($target)))
            }
            finally { $stream.Dispose(); $sha.Dispose() }
            if ($targetHash -ne $sourceHash) {
                throw "Ya existe otra version de $($entry.Name). No se ha sustituido ninguna fuente."
            }
        }
    }

    foreach ($entry in $entries) {
        $target = Join-Path $fontRoot $entry.Name
        if (-not $PSCmdlet.ShouldProcess($target, 'Instalar y registrar fuente para el usuario actual')) {
            continue
        }
        New-Item -ItemType Directory -Path $fontRoot -Force | Out-Null
        if (-not (Test-Path -LiteralPath $registryPath)) {
            New-Item -Path $registryPath | Out-Null
        }
        if (-not (Test-Path -LiteralPath $target)) {
            [IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $target, $false)
        }
        if ([Nexo.FontInstaller]::AddFontResourceEx($target, 0, [IntPtr]::Zero) -eq 0) {
            throw "Windows no pudo cargar $($entry.Name)."
        }
        $kind = if ($entry.Name.EndsWith('.otf')) { 'OpenType' } else { 'TrueType' }
        $name = $fontNames[$entry.Name] + " ($kind)"
        New-ItemProperty -Path $registryPath -Name $name -Value $target -PropertyType String -Force | Out-Null
        $installed++
        Write-Output "Disponible: $name"
    }
} finally {
    $archive.Dispose()
}

if ($installed -gt 0) {
    $result = [UIntPtr]::Zero
    [void][Nexo.FontInstaller]::SendMessageTimeout([IntPtr]0xffff, 0x001D,
        [UIntPtr]::Zero, [IntPtr]::Zero, 2, 1000, [ref]$result)
    Write-Output "$installed fuentes registradas. Cierra y vuelve a abrir Nexo PC para aplicarlas."
}
