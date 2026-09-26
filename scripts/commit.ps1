<#
.SYNOPSIS
  Formulario interactivo de commit según docs/CONVENCIONES.md

.DESCRIPTION
  Lee scripts/commit-config.json (editable) y arma el mensaje:
    Tipo / descripción
    Tipo(ámbito): descripción

.PARAMETER DryRun
  Solo muestra el mensaje; no hace stage ni commit.

.EXAMPLE
  .\scripts\commit.ps1
  .\scripts\commit.ps1 -DryRun
#>
[CmdletBinding()]
param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
  $root = git rev-parse --show-toplevel 2>$null
  if (-not $root) { throw 'No estás dentro de un repositorio git.' }
  return $root.Trim()
}

function Read-CommitConfig {
  param([string]$RepoRoot)
  $path = Join-Path $RepoRoot 'scripts\commit-config.json'
  if (-not (Test-Path $path)) {
    throw "No se encontró $path. Crea o restaura commit-config.json."
  }
  return Get-Content -Raw -Encoding UTF8 $path | ConvertFrom-Json
}

function Show-Status {
  Write-Host ''
  Write-Host '=== Estado del repositorio ===' -ForegroundColor Cyan
  git status -sb
  Write-Host ''
  git status --short
  Write-Host ''
}

function Confirm-Yes([string]$Prompt, [bool]$DefaultYes = $true) {
  $suf = if ($DefaultYes) { '[S/n]' } else { '[s/N]' }
  $r = Read-Host "$Prompt $suf"
  if ([string]::IsNullOrWhiteSpace($r)) { return $DefaultYes }
  return $r -match '^(s|si|sí|y|yes)$'
}

function Stage-Changes {
  Write-Host 'Stage:' -ForegroundColor Cyan
  Write-Host '  1) Todo (git add -A)'
  Write-Host '  2) Solo ya trackeados (git add -u)'
  Write-Host '  3) Nada (usar lo que ya esté en staging)'
  Write-Host '  4) Cancelar'
  $opt = Read-Host 'Opción'
  switch ($opt) {
    '1' { git add -A; return $true }
    '2' { git add -u; return $true }
    '3' { return $true }
    '4' { return $false }
    default {
      Write-Host 'Opción inválida.' -ForegroundColor Red
      return $false
    }
  }
}

function Select-Type($Config) {
  Write-Host ''
  Write-Host '=== Tipo de commit ===' -ForegroundColor Cyan
  foreach ($t in $Config.types) {
    Write-Host ("  {0,2}) {1,-16} {2}" -f $t.id, $t.prefix, $t.label)
  }
  Write-Host ''
  $id = Read-Host 'Número de tipo'
  $selected = $Config.types | Where-Object { $_.id -eq $id }
  if (-not $selected) { throw "Tipo inválido: $id" }
  return $selected
}

function Build-Title($Type, [string]$Scope, [string]$Description) {
  $desc = $Description.Trim()
  if (-not $desc) { throw 'La descripción no puede estar vacía.' }

  if ($Scope) {
    $name = ($Type.prefix -replace '\s*/\s*$', '').Trim()
    return "${name}(${Scope}): $desc"
  }

  if ($Type.style -eq 'colon') {
    return "$($Type.prefix): $desc"
  }

  $prefix = $Type.prefix
  if ($prefix -notmatch '/\s*$') { $prefix = "$prefix /" }
  if ($prefix -notmatch '/ $') { $prefix = ($prefix -replace '/\s*$', '/ ') }
  return "$prefix$desc"
}

function Show-Examples($Config) {
  if (-not $Config.examples) { return }
  Write-Host ''
  Write-Host 'Ejemplos:' -ForegroundColor DarkGray
  foreach ($ex in $Config.examples) {
    Write-Host "  - $ex" -ForegroundColor DarkGray
  }
}

# --- main ---
$repoRoot = Get-RepoRoot
Set-Location $repoRoot
$config = Read-CommitConfig -RepoRoot $repoRoot
$maxLen = if ($config.maxTitleLength) { [int]$config.maxTitleLength } else { 50 }

Show-Status
Show-Examples $config

if (-not $DryRun) {
  $staged = git diff --cached --name-only
  $hasStaged = -not [string]::IsNullOrWhiteSpace(($staged | Out-String).Trim())
  if (-not $hasStaged) {
    if (-not (Confirm-Yes 'No hay nada en staging. ¿Stagear cambios ahora?')) {
      Write-Host 'Cancelado.' -ForegroundColor Yellow
      exit 0
    }
    if (-not (Stage-Changes)) {
      Write-Host 'Cancelado.' -ForegroundColor Yellow
      exit 0
    }
  } else {
    Write-Host 'Ya hay archivos en staging.' -ForegroundColor Green
    if (Confirm-Yes '¿Quieres cambiar el staging?' $false) {
      if (-not (Stage-Changes)) {
        Write-Host 'Cancelado.' -ForegroundColor Yellow
        exit 0
      }
    }
  }

  $stagedAfter = git diff --cached --name-only
  if ([string]::IsNullOrWhiteSpace(($stagedAfter | Out-String).Trim())) {
    Write-Host 'No hay cambios en staging. Nada que commitear.' -ForegroundColor Yellow
    exit 0
  }
}

$type = Select-Type $config
$scope = Read-Host 'Ámbito opcional (ej. auth, ui) — Enter para omitir'
$description = Read-Host 'Descripción (imperativo: agregar, corregir, actualizar...)'
$title = Build-Title -Type $type -Scope $scope.Trim() -Description $description

if ($title.Length -gt $maxLen) {
  Write-Host ''
  Write-Host "Aviso: el título tiene $($title.Length) caracteres (recomendado ≤ $maxLen)." -ForegroundColor Yellow
  if (-not (Confirm-Yes '¿Continuar igual?')) {
    Write-Host 'Cancelado.' -ForegroundColor Yellow
    exit 0
  }
}

Write-Host ''
$bodyLines = @()
$body = Read-Host 'Cuerpo opcional (qué/por qué) — Enter para omitir'
if ($body.Trim()) { $bodyLines += $body.Trim() }
$closes = Read-Host 'Issue a cerrar (número, ej. 12) — Enter para omitir'
if ($closes.Trim() -match '^\d+$') { $bodyLines += "Closes #$($closes.Trim())" }

$message = $title
if ($bodyLines.Count -gt 0) {
  $message = $title + "`n`n" + ($bodyLines -join "`n")
}

Write-Host ''
Write-Host '=== Vista previa del commit ===' -ForegroundColor Cyan
Write-Host $message -ForegroundColor White
Write-Host '================================' -ForegroundColor Cyan
Write-Host ''

if ($DryRun) {
  Write-Host 'DryRun: no se hizo commit.' -ForegroundColor Yellow
  exit 0
}

if (-not (Confirm-Yes '¿Crear este commit?')) {
  Write-Host 'Cancelado.' -ForegroundColor Yellow
  exit 0
}

$msgFile = Join-Path $repoRoot '.git\COMMIT_EDITMSG_FORM.txt'
# UTF-8 sin BOM para evitar basura en el mensaje
[System.IO.File]::WriteAllText($msgFile, ($message -replace "`r`n", "`n") + "`n", [System.Text.UTF8Encoding]::new($false))

try {
  git commit -F $msgFile
  Write-Host ''
  Write-Host 'Commit creado:' -ForegroundColor Green
  git log -1 --format='%h %s'
  Write-Host ''
  Write-Host 'Para subir: git push' -ForegroundColor DarkGray
}
finally {
  Remove-Item $msgFile -Force -ErrorAction SilentlyContinue
}
