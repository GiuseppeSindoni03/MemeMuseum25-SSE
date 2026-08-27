param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("before", "after")]
    [string]$Phase,

    [Parameter(Mandatory=$false)]
    [ValidateSet("load", "stress", "browse")]
    [string]$TestType = "load"
)

$RootDir = (Get-Location).Path
$OutputDir = Join-Path $RootDir "Docs\EnergiBridge\raw_data\$TestType\$Phase"
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$JMeterBat = "C:\Users\Peppe\Downloads\apache-jmeter-5.6.3\bin\jmeter.bat"

if ($TestType -eq "stress") {
    $TestPlan = Join-Path $RootDir "Docs\JMeter\02_StressTest.jmx"
} elseif ($TestType -eq "browse") {
    $TestPlan = Join-Path $RootDir "Docs\JMeter\05_Browse_LoadTest.jmx"
} else {
    $TestPlan = Join-Path $RootDir "Docs\JMeter\01_LoadTest.jmx"
}

$Runs = 10
$CooldownSeconds = 10

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Avvio Campagna EnergiBridge" -ForegroundColor Cyan
Write-Host " Tipo Test: $TestType | Fase: $Phase" -ForegroundColor Cyan
Write-Host " Test Plan: $TestPlan | Numero di Run: $Runs" -ForegroundColor Cyan
Write-Host " Cartella Output: $OutputDir" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

for ($i = 1; $i -le $Runs; $i++) {
    $OutputFile = Join-Path $OutputDir "run_$i.csv"
    $TempJtl = Join-Path $OutputDir "temp_$i.jtl"
    
    Write-Host "`n[Run $i/$Runs] Avvio misurazione con EnergiBridge..." -ForegroundColor Yellow
    
    # Esegue EnergiBridge wrappando JMeter tramite cmd.exe per i file .bat
    .\Docs\EnergiBridge\bin\energibridge.exe --output $OutputFile cmd.exe /c $JMeterBat -n -t $TestPlan -l $TempJtl
    
    # Pulizia file JTL temporaneo
    if (Test-Path $TempJtl) { Remove-Item $TempJtl -Force }

    Write-Host "[Run $i/$Runs] Completato. Dati salvati in $OutputFile" -ForegroundColor Green
    
    if ($i -lt $Runs) {
        Write-Host "Pausa termica di $CooldownSeconds secondi..." -ForegroundColor Gray
        Start-Sleep -Seconds $CooldownSeconds
    }
}

Write-Host "`nCampagna $TestType ($Phase) terminata con successo!" -ForegroundColor Green


