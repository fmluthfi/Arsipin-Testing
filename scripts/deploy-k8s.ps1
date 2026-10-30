param([string]$ApiUrl = $env:NEXT_PUBLIC_API_URL)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$namespace = "arsipin-dev"
$imageTag = "arsipin:0.1.0"

if ([string]::IsNullOrWhiteSpace($ApiUrl)) { $ApiUrl = "http://localhost:4000/api" }
foreach ($commandName in @("docker", "kubectl")) {
  if (-not (Get-Command $commandName -ErrorAction SilentlyContinue)) {
    throw "$commandName tidak ditemukan. Pastikan tersedia di PATH."
  }
}

function Invoke-Kubectl {
  param([Parameter(Mandatory)][string[]]$Arguments)
  & kubectl @Arguments
  if ($LASTEXITCODE -ne 0) { throw "Perintah kubectl gagal: kubectl $($Arguments -join ' ')" }
}

Write-Host "Membangun image frontend $imageTag..."
& docker build --pull --build-arg "NEXT_PUBLIC_API_URL=$ApiUrl" --tag $imageTag $projectRoot
if ($LASTEXITCODE -ne 0) { throw "Build image frontend gagal." }

Write-Host "Memeriksa cluster Kubernetes..."
Invoke-Kubectl @("cluster-info")
Invoke-Kubectl @("get", "namespace", $namespace)

Write-Host "Menerapkan Deployment frontend dan Service..."
Invoke-Kubectl @("apply", "-f", (Join-Path $projectRoot "deployment.yaml"))
Invoke-Kubectl @("apply", "-f", (Join-Path $projectRoot "service.yaml"))
Invoke-Kubectl @("rollout", "restart", "deployment/arsipin", "-n", $namespace)
Invoke-Kubectl @("rollout", "status", "deployment/arsipin", "-n", $namespace, "--timeout=180s")

Write-Host "Status pod dan Service:"
Invoke-Kubectl @("get", "pods,svc", "-n", $namespace)
