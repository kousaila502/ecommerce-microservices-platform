# Scheduled Traditional CI/CD Pipeline Execution Script
# ESI-SBA Thesis Research - Phase 2 Statistical Baseline Collection
# Author: Academic Research Automation
# Purpose: Systematic pipeline execution with consistent timing

param(
    [string]$ProjectPath = "C:\Users\hp\microservices-thesis\e-commerce-microservices-sample",
    [string]$AppPath = "users-cna-microservice\app.py",
    [string]$StartVersion = "6.2.1.1",
    [int]$TotalRuns = 8,
    [int]$IntervalMinutes = 45
)

# ===============================================
# CONFIGURATION AND SETUP
# ===============================================

$ErrorActionPreference = "Stop"
$LogFile = Join-Path $ProjectPath "pipeline_execution_log.txt"

# Schedule Configuration - Starting from current time (17:16)
$ScheduledTimes = @(
    "17:30",  # 5:30 PM - Run #3 (14 minutes from now)
    "18:15",  # 6:15 PM - Run #4  
    "19:00",  # 7:00 PM - Run #5
    "19:45",  # 7:45 PM - Run #6
    "20:30",  # 8:30 PM - Run #7
    "21:15",  # 9:15 PM - Run #8
    "22:00",  # 10:00 PM - Run #9
    "22:45"   # 10:45 PM - Run #10
)

# ===============================================
# LOGGING FUNCTIONS
# ===============================================

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

function Initialize-Log {
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $HeaderMessage = "================================================================================`n"
    $HeaderMessage += "ESI-SBA THESIS RESEARCH - TRADITIONAL CI/CD BASELINE COLLECTION`n"
    $HeaderMessage += "================================================================================`n"
    $HeaderMessage += "Script Started: $Timestamp`n"
    $HeaderMessage += "Project Path: $ProjectPath`n"
    $HeaderMessage += "Total Scheduled Runs: $($ScheduledTimes.Count)`n"
    $HeaderMessage += "Interval Strategy: Fixed time schedule`n"
    $HeaderMessage += "Research Phase: Phase 2 - Statistical Baseline Establishment`n"
    $HeaderMessage += "================================================================================"
    
    Write-Host $HeaderMessage -ForegroundColor Green
    Set-Content -Path $LogFile -Value $HeaderMessage
}

# ===============================================
# CORE FUNCTIONS
# ===============================================

function Get-CurrentVersion {
    $AppFile = Join-Path $ProjectPath $AppPath
    $Content = Get-Content $AppFile -Raw
    
    if ($Content -match '"version":\s*"([^"]+)"') {
        return $Matches[1]
    }
    
    Write-Log "Could not find version in app.py, using default" "WARNING"
    return $StartVersion
}

function Update-Version {
    param([string]$NewVersion)
    
    $AppFile = Join-Path $ProjectPath $AppPath
    $Content = Get-Content $AppFile -Raw
    
    # Update version in the health check endpoint
    $UpdatedContent = $Content -replace '"version":\s*"[^"]+"', "`"version`": `"$NewVersion`""
    
    Set-Content -Path $AppFile -Value $UpdatedContent -Encoding UTF8
    Write-Log "Updated version to $NewVersion in $AppPath" "SUCCESS"
}

function Increment-Version {
    param([string]$CurrentVersion)
    
    # Handle version format like "6.2.1.1" (with patch.hotfix)
    if ($CurrentVersion -match '^(\d+)\.(\d+)\.(\d+)\.(\d+)$') {
        $Major = [int]$Matches[1]
        $Minor = [int]$Matches[2] 
        $Patch = [int]$Matches[3]
        $Hotfix = [int]$Matches[4]
        
        $Hotfix++
        return "$Major.$Minor.$Patch.$Hotfix"
    }
    # Handle standard version format like "6.2.1"
    elseif ($CurrentVersion -match '^(\d+)\.(\d+)\.(\d+)$') {
        $Major = [int]$Matches[1]
        $Minor = [int]$Matches[2] 
        $Patch = [int]$Matches[3]
        
        $Patch++
        return "$Major.$Minor.$Patch"
    }
    
    Write-Log "Invalid version format: $CurrentVersion" "ERROR"
    throw "Cannot increment version"
}

function Execute-GitOperations {
    param([string]$RunNumber, [string]$Version)
    
    Set-Location $ProjectPath
    
    try {
        Write-Log "Starting Git operations for Run #$RunNumber (v$Version)"
        
        # Add all changes
        $AddResult = & git add . 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Git add failed: $AddResult"
        }
        
        # Commit with research-formatted message
        $CommitMessage = "Phase2-Run$RunNumber`: Update version to $Version for systematic baseline collection"
        $CommitResult = & git commit -m $CommitMessage 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Git commit failed: $CommitResult"
        }
        
        # Push to trigger pipeline
        $PushResult = & git push 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw "Git push failed: $PushResult"
        }
        
        Write-Log "Git operations completed successfully" "SUCCESS"
        Write-Log "Pipeline should be triggered automatically" "INFO"
        
    } catch {
        Write-Log "Git operations failed: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Wait-ForScheduledTime {
    param([string]$TargetTime)
    
    $Today = Get-Date -Format "yyyy-MM-dd"
    $TargetDateTime = [DateTime]"$Today $TargetTime"
    
    # If target time has passed today, schedule for tomorrow
    if ($TargetDateTime -lt (Get-Date)) {
        $TargetDateTime = $TargetDateTime.AddDays(1)
        $FormattedDate = $TargetDateTime.ToString("yyyy-MM-dd HH:mm:ss")
        Write-Log "Target time has passed, scheduling for tomorrow: $FormattedDate" "INFO"
    }
    
    while ((Get-Date) -lt $TargetDateTime) {
        $TimeRemaining = $TargetDateTime - (Get-Date)
        $Minutes = [math]::Floor($TimeRemaining.TotalMinutes)
        $Seconds = $TimeRemaining.Seconds
        
        Write-Host "`rWaiting for scheduled time $TargetTime... ($Minutes min $Seconds sec remaining)" -NoNewline -ForegroundColor Yellow
        Start-Sleep 10
    }
    Write-Host ""  # New line after countdown
}

function Display-RunSummary {
    param([int]$RunNumber, [string]$Version, [string]$ActualTime)
    
    $CurrentTime = Get-Date -Format "HH:mm:ss"
    
    Write-Host "`n================================" -ForegroundColor Green
    Write-Host "PIPELINE RUN EXECUTED" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host "Run Number: #$RunNumber"
    Write-Host "Version: $Version"
    Write-Host "Scheduled Time: $ActualTime"
    Write-Host "Actual Execution: $CurrentTime"
    Write-Host "Status: Pipeline Triggered" -ForegroundColor Green
    Write-Host "`nNEXT STEPS FOR YOU:"
    Write-Host "1. Monitor GitHub Actions for manual approval gates"
    Write-Host "2. Record approval times in your research log"
    Write-Host "3. Wait for pipeline completion"
    Write-Host "4. Verify metrics in Grafana dashboard"
    Write-Host "`nNext run scheduled in $IntervalMinutes minutes..."
    Write-Host "================================`n" -ForegroundColor Green
    
    Write-Log "Run #$RunNumber summary displayed" "INFO"
}

function Show-ManualApprovalReminder {
    Write-Host "`n=================================================" -ForegroundColor Cyan
    Write-Host "IMPORTANT: MANUAL APPROVAL MONITORING REQUIRED" -ForegroundColor Cyan
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "Your Traditional CI/CD pipeline includes 3 manual approval gates:"
    Write-Host ""
    Write-Host "1. Code Review Approval (after build/test)"
    Write-Host "2. Security Compliance Approval (after Docker build)"
    Write-Host "3. Production Release Approval (conditional)"
    Write-Host ""
    Write-Host "FOR YOUR RESEARCH DATA:" -ForegroundColor Yellow
    Write-Host "- Keep GitHub Actions tab open"
    Write-Host "- Record exact times when approval requests appear"
    Write-Host "- Click approve and note your response time"
    Write-Host "- This human factor data is CRITICAL for your thesis"
    Write-Host ""
    Write-Host "The script handles triggering - YOU handle approving!" -ForegroundColor Red
    Write-Host "=================================================`n" -ForegroundColor Cyan
}

# ===============================================
# MAIN EXECUTION LOGIC
# ===============================================

function Start-ScheduledPipelineExecution {
    try {
        Initialize-Log
        Show-ManualApprovalReminder
        
        $CurrentVersion = Get-CurrentVersion
        Write-Log "Starting automated pipeline execution from version $CurrentVersion"
        Write-Log "Total scheduled runs: $($ScheduledTimes.Count)"
        
        for ($i = 0; $i -lt $ScheduledTimes.Count; $i++) {
            $RunNumber = $i + 3  # Starting from Run #3 (assuming Run #1 and #2 already completed)
            $ScheduledTime = $ScheduledTimes[$i]
            
            Write-Log "Preparing Run #$RunNumber scheduled for $ScheduledTime"
            
            # Wait for scheduled time
            Wait-ForScheduledTime -TargetTime $ScheduledTime
            
            # Increment version
            $NewVersion = Increment-Version -CurrentVersion $CurrentVersion
            
            # Update app.py with new version
            Update-Version -NewVersion $NewVersion
            
            # Execute git operations to trigger pipeline
            Execute-GitOperations -RunNumber $RunNumber -Version $NewVersion
            
            # Display run summary
            Display-RunSummary -RunNumber $RunNumber -Version $NewVersion -ActualTime $ScheduledTime
            
            # Update current version for next iteration
            $CurrentVersion = $NewVersion
            
            Write-Log "Run #$RunNumber triggered successfully. Pipeline should be running now." "SUCCESS"
            
            # Brief pause before next iteration (except for last run)
            if ($i -lt ($ScheduledTimes.Count - 1)) {
                Write-Log "Waiting before preparing next run..." "INFO"
                Start-Sleep 30
            }
        }
        
        Write-Log "All scheduled pipeline runs have been triggered!" "SUCCESS"
        Write-Log "Check your Grafana dashboard at http://localhost:30300 for trend analysis" "INFO"
        
    } catch {
        Write-Log "Script execution failed: $($_.Exception.Message)" "ERROR"
        Write-Host "Script failed. Check the log file: $LogFile" -ForegroundColor Red
        throw
    }
}

# ===============================================
# SCRIPT VALIDATION AND STARTUP
# ===============================================

function Test-Prerequisites {
    Write-Log "Validating prerequisites..."
    
    # Check if project directory exists
    if (!(Test-Path $ProjectPath)) {
        throw "Project directory not found: $ProjectPath"
    }
    
    # Check if app.py exists
    $AppFile = Join-Path $ProjectPath $AppPath
    if (!(Test-Path $AppFile)) {
        throw "App file not found: $AppFile"
    }
    
    # Test git availability
    try {
        $GitVersion = & git --version 2>&1
        Write-Log "Git available: $GitVersion" "SUCCESS"
    } catch {
        throw "Git not available. Please ensure Git is installed and in PATH."
    }
    
    # Verify we're in the right git repository
    Set-Location $ProjectPath
    $GitRemote = & git remote get-url origin 2>&1
    if ($GitRemote -notlike "*ecommerce-microservices-platform*") {
        Write-Log "Warning: Git remote doesn't match expected repository" "WARNING"
    }
    
    Write-Log "All prerequisites validated successfully" "SUCCESS"
}

# ===============================================
# SCRIPT ENTRY POINT
# ===============================================

Write-Host "================================================================================" -ForegroundColor Magenta
Write-Host "ESI-SBA THESIS RESEARCH AUTOMATION SCRIPT" -ForegroundColor Magenta
Write-Host "Traditional CI/CD Pipeline Systematic Execution" -ForegroundColor Magenta
Write-Host "Phase 2: Statistical Baseline Collection" -ForegroundColor Magenta
Write-Host "================================================================================" -ForegroundColor Magenta

try {
    Test-Prerequisites
    Write-Host "Prerequisites validated. Starting scheduled execution..." -ForegroundColor Green
    Start-ScheduledPipelineExecution
    
    Write-Host "`n===========================================" -ForegroundColor Green
    Write-Host "SCRIPT EXECUTION COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    Write-Host "All pipeline runs have been triggered according to schedule"
    Write-Host "Monitor Grafana dashboard for real-time trend analysis"
    Write-Host "Your research data collection is now complete"
    Write-Host "Check the log file for detailed execution history: $LogFile"
    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "1. Verify all pipelines completed successfully"
    Write-Host "2. Export data from Grafana for statistical analysis"
    Write-Host "3. Prepare baseline summary for GitOps comparison phase"
    Write-Host ""
    Write-Host "Phase 2 Traditional CI/CD baseline collection complete!" -ForegroundColor Green
    Write-Host "===========================================" -ForegroundColor Green
    
} catch {
    Write-Host "Script execution failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the log file for details: $LogFile" -ForegroundColor Yellow
    exit 1
}