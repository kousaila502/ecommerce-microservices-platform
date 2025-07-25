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
    $HeaderMessage = @"
================================================================================
ESI-SBA THESIS RESEARCH - TRADITIONAL CI/CD BASELINE COLLECTION
================================================================================
Script Started: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project Path: $ProjectPath
Total Scheduled Runs: $($ScheduledTimes.Count)
Interval Strategy: Fixed time schedule
Research Phase: Phase 2 - Statistical Baseline Establishment
================================================================================
"@
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
    if ($CurrentVersion -match '^(\d+)\.(\d+)\.(\d+)\.(\d+)

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
        $CommitMessage = "Phase2-Run#$RunNumber: Update version to $Version for systematic baseline collection"
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
        Write-Log "Target time has passed, scheduling for tomorrow: $($TargetDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" "INFO"
    }
    
    while ((Get-Date) -lt $TargetDateTime) {
        $TimeRemaining = $TargetDateTime - (Get-Date)
        $Minutes = [math]::Floor($TimeRemaining.TotalMinutes)
        $Seconds = $TimeRemaining.Seconds
        
        Write-Host "`r⏰ Waiting for scheduled time $TargetTime... ($Minutes min $Seconds sec remaining)" -NoNewline -ForegroundColor Yellow
        Start-Sleep 10
    }
    Write-Host ""  # New line after countdown
}

function Display-RunSummary {
    param([int]$RunNumber, [string]$Version, [string]$ActualTime)
    
    $Summary = @"

🎯 PIPELINE RUN EXECUTED
================================
Run Number: #$RunNumber
Version: $Version  
Scheduled Time: $ActualTime
Actual Execution: $(Get-Date -Format "HH:mm:ss")
Status: Pipeline Triggered ✅

📋 NEXT STEPS FOR YOU:
1. Monitor GitHub Actions for manual approval gates
2. Record approval times in your research log
3. Wait for pipeline completion
4. Verify metrics in Grafana dashboard

⏳ Next run scheduled in $IntervalMinutes minutes...
================================

"@
    Write-Host $Summary -ForegroundColor Green
    Write-Log "Run #$RunNumber summary displayed" "INFO"
}

function Show-ManualApprovalReminder {
    $Reminder = @"

🚨 IMPORTANT: MANUAL APPROVAL MONITORING REQUIRED
=================================================
Your Traditional CI/CD pipeline includes 3 manual approval gates:

1. 🔍 Code Review Approval (after build/test)
2. 🔒 Security Compliance Approval (after Docker build)  
3. 🏭 Production Release Approval (conditional)

📊 FOR YOUR RESEARCH DATA:
- Keep GitHub Actions tab open: https://github.com/kousaila502/ecommerce-microservices-platform/actions
- Record exact times when approval requests appear
- Click approve and note your response time
- This human factor data is CRITICAL for your thesis

⚠️ The script handles triggering - YOU handle approving!
=================================================

"@
    Write-Host $Reminder -ForegroundColor Cyan
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
        Write-Host "❌ Script failed. Check the log file: $LogFile" -ForegroundColor Red
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

Write-Host @"
================================================================================
🎓 ESI-SBA THESIS RESEARCH AUTOMATION SCRIPT
🔄 Traditional CI/CD Pipeline Systematic Execution
📊 Phase 2: Statistical Baseline Collection
================================================================================
"@ -ForegroundColor Magenta

try {
    Test-Prerequisites
    Write-Host "✅ Prerequisites validated. Starting scheduled execution..." -ForegroundColor Green
    Start-ScheduledPipelineExecution
    
    Write-Host @"

🎉 SCRIPT EXECUTION COMPLETED SUCCESSFULLY!
==========================================
📊 All pipeline runs have been triggered according to schedule
📈 Monitor Grafana dashboard for real-time trend analysis
📋 Your research data collection is now complete
📚 Check the log file for detailed execution history: $LogFile

🔍 Next Steps:
1. Verify all pipelines completed successfully
2. Export data from Grafana for statistical analysis  
3. Prepare baseline summary for GitOps comparison phase

✅ Phase 2 Traditional CI/CD baseline collection complete!
==========================================

"@ -ForegroundColor Green
    
} catch {
    Write-Host "❌ Script execution failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Check the log file for details: $LogFile" -ForegroundColor Yellow
    exit 1
}

# ===============================================
# USAGE INSTRUCTIONS
# ===============================================

<#
.SYNOPSIS
Automated Traditional CI/CD Pipeline Execution for Academic Research

.DESCRIPTION
This PowerShell script systematically triggers Traditional CI/CD pipeline runs
for ESI-SBA thesis research on Traditional CI/CD vs GitOps comparison.

.PARAMETER ProjectPath
Path to the microservices project directory
Default: C:\Users\hp\microservices-thesis\e-commerce-microservices-sample

.PARAMETER AppPath  
Relative path to the app.py file within the project
Default: users-cna-microservice\app.py

.PARAMETER StartVersion
Starting version number for incrementation
Default: 6.2.3

.PARAMETER TotalRuns
Total number of pipeline runs to execute
Default: 8

.PARAMETER IntervalMinutes
Minutes between scheduled runs (for reference only - uses fixed schedule)
Default: 45

.EXAMPLE
.\ScheduledPipelineExecution.ps1
Runs with default parameters

.EXAMPLE  
.\ScheduledPipelineExecution.ps1 -StartVersion "6.3.0" -TotalRuns 10
Starts from version 6.3.0 and schedules 10 runs

.NOTES
- Requires Git to be installed and configured
- Requires access to the GitHub repository
- Manual approval gates still require human intervention
- Monitor GitHub Actions for approval requests
- Check Grafana dashboard for real-time metrics
#>) {
        $Major = [int]$Matches[1]
        $Minor = [int]$Matches[2] 
        $Patch = [int]$Matches[3]
        $Hotfix = [int]$Matches[4]
        
        $Hotfix++
        return "$Major.$Minor.$Patch.$Hotfix"
    }
    # Handle standard version format like "6.2.1"
    elseif ($CurrentVersion -match '^(\d+)\.(\d+)\.(\d+)

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
        $CommitMessage = "Phase2-Run#$RunNumber: Update version to $Version for systematic baseline collection"
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
        Write-Log "Target time has passed, scheduling for tomorrow: $($TargetDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" "INFO"
    }
    
    while ((Get-Date) -lt $TargetDateTime) {
        $TimeRemaining = $TargetDateTime - (Get-Date)
        $Minutes = [math]::Floor($TimeRemaining.TotalMinutes)
        $Seconds = $TimeRemaining.Seconds
        
        Write-Host "`r⏰ Waiting for scheduled time $TargetTime... ($Minutes min $Seconds sec remaining)" -NoNewline -ForegroundColor Yellow
        Start-Sleep 10
    }
    Write-Host ""  # New line after countdown
}

function Display-RunSummary {
    param([int]$RunNumber, [string]$Version, [string]$ActualTime)
    
    $Summary = @"

🎯 PIPELINE RUN EXECUTED
================================
Run Number: #$RunNumber
Version: $Version  
Scheduled Time: $ActualTime
Actual Execution: $(Get-Date -Format "HH:mm:ss")
Status: Pipeline Triggered ✅

📋 NEXT STEPS FOR YOU:
1. Monitor GitHub Actions for manual approval gates
2. Record approval times in your research log
3. Wait for pipeline completion
4. Verify metrics in Grafana dashboard

⏳ Next run scheduled in $IntervalMinutes minutes...
================================

"@
    Write-Host $Summary -ForegroundColor Green
    Write-Log "Run #$RunNumber summary displayed" "INFO"
}

function Show-ManualApprovalReminder {
    $Reminder = @"

🚨 IMPORTANT: MANUAL APPROVAL MONITORING REQUIRED
=================================================
Your Traditional CI/CD pipeline includes 3 manual approval gates:

1. 🔍 Code Review Approval (after build/test)
2. 🔒 Security Compliance Approval (after Docker build)  
3. 🏭 Production Release Approval (conditional)

📊 FOR YOUR RESEARCH DATA:
- Keep GitHub Actions tab open: https://github.com/kousaila502/ecommerce-microservices-platform/actions
- Record exact times when approval requests appear
- Click approve and note your response time
- This human factor data is CRITICAL for your thesis

⚠️ The script handles triggering - YOU handle approving!
=================================================

"@
    Write-Host $Reminder -ForegroundColor Cyan
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
        Write-Host "❌ Script failed. Check the log file: $LogFile" -ForegroundColor Red
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

Write-Host @"
================================================================================
🎓 ESI-SBA THESIS RESEARCH AUTOMATION SCRIPT
🔄 Traditional CI/CD Pipeline Systematic Execution
📊 Phase 2: Statistical Baseline Collection
================================================================================
"@ -ForegroundColor Magenta

try {
    Test-Prerequisites
    Write-Host "✅ Prerequisites validated. Starting scheduled execution..." -ForegroundColor Green
    Start-ScheduledPipelineExecution
    
    Write-Host @"

🎉 SCRIPT EXECUTION COMPLETED SUCCESSFULLY!
==========================================
📊 All pipeline runs have been triggered according to schedule
📈 Monitor Grafana dashboard for real-time trend analysis
📋 Your research data collection is now complete
📚 Check the log file for detailed execution history: $LogFile

🔍 Next Steps:
1. Verify all pipelines completed successfully
2. Export data from Grafana for statistical analysis  
3. Prepare baseline summary for GitOps comparison phase

✅ Phase 2 Traditional CI/CD baseline collection complete!
==========================================

"@ -ForegroundColor Green
    
} catch {
    Write-Host "❌ Script execution failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Check the log file for details: $LogFile" -ForegroundColor Yellow
    exit 1
}

# ===============================================
# USAGE INSTRUCTIONS
# ===============================================

<#
.SYNOPSIS
Automated Traditional CI/CD Pipeline Execution for Academic Research

.DESCRIPTION
This PowerShell script systematically triggers Traditional CI/CD pipeline runs
for ESI-SBA thesis research on Traditional CI/CD vs GitOps comparison.

.PARAMETER ProjectPath
Path to the microservices project directory
Default: C:\Users\hp\microservices-thesis\e-commerce-microservices-sample

.PARAMETER AppPath  
Relative path to the app.py file within the project
Default: users-cna-microservice\app.py

.PARAMETER StartVersion
Starting version number for incrementation
Default: 6.2.3

.PARAMETER TotalRuns
Total number of pipeline runs to execute
Default: 8

.PARAMETER IntervalMinutes
Minutes between scheduled runs (for reference only - uses fixed schedule)
Default: 45

.EXAMPLE
.\ScheduledPipelineExecution.ps1
Runs with default parameters

.EXAMPLE  
.\ScheduledPipelineExecution.ps1 -StartVersion "6.3.0" -TotalRuns 10
Starts from version 6.3.0 and schedules 10 runs

.NOTES
- Requires Git to be installed and configured
- Requires access to the GitHub repository
- Manual approval gates still require human intervention
- Monitor GitHub Actions for approval requests
- Check Grafana dashboard for real-time metrics
#>) {
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
        $CommitMessage = "Phase2-Run#$RunNumber: Update version to $Version for systematic baseline collection"
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
        Write-Log "Target time has passed, scheduling for tomorrow: $($TargetDateTime.ToString('yyyy-MM-dd HH:mm:ss'))" "INFO"
    }
    
    while ((Get-Date) -lt $TargetDateTime) {
        $TimeRemaining = $TargetDateTime - (Get-Date)
        $Minutes = [math]::Floor($TimeRemaining.TotalMinutes)
        $Seconds = $TimeRemaining.Seconds
        
        Write-Host "`r⏰ Waiting for scheduled time $TargetTime... ($Minutes min $Seconds sec remaining)" -NoNewline -ForegroundColor Yellow
        Start-Sleep 10
    }
    Write-Host ""  # New line after countdown
}

function Display-RunSummary {
    param([int]$RunNumber, [string]$Version, [string]$ActualTime)
    
    $Summary = @"

🎯 PIPELINE RUN EXECUTED
================================
Run Number: #$RunNumber
Version: $Version  
Scheduled Time: $ActualTime
Actual Execution: $(Get-Date -Format "HH:mm:ss")
Status: Pipeline Triggered ✅

📋 NEXT STEPS FOR YOU:
1. Monitor GitHub Actions for manual approval gates
2. Record approval times in your research log
3. Wait for pipeline completion
4. Verify metrics in Grafana dashboard

⏳ Next run scheduled in $IntervalMinutes minutes...
================================

"@
    Write-Host $Summary -ForegroundColor Green
    Write-Log "Run #$RunNumber summary displayed" "INFO"
}

function Show-ManualApprovalReminder {
    $Reminder = @"

🚨 IMPORTANT: MANUAL APPROVAL MONITORING REQUIRED
=================================================
Your Traditional CI/CD pipeline includes 3 manual approval gates:

1. 🔍 Code Review Approval (after build/test)
2. 🔒 Security Compliance Approval (after Docker build)  
3. 🏭 Production Release Approval (conditional)

📊 FOR YOUR RESEARCH DATA:
- Keep GitHub Actions tab open: https://github.com/kousaila502/ecommerce-microservices-platform/actions
- Record exact times when approval requests appear
- Click approve and note your response time
- This human factor data is CRITICAL for your thesis

⚠️ The script handles triggering - YOU handle approving!
=================================================

"@
    Write-Host $Reminder -ForegroundColor Cyan
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
        Write-Host "❌ Script failed. Check the log file: $LogFile" -ForegroundColor Red
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

Write-Host @"
================================================================================
🎓 ESI-SBA THESIS RESEARCH AUTOMATION SCRIPT
🔄 Traditional CI/CD Pipeline Systematic Execution
📊 Phase 2: Statistical Baseline Collection
================================================================================
"@ -ForegroundColor Magenta

try {
    Test-Prerequisites
    Write-Host "✅ Prerequisites validated. Starting scheduled execution..." -ForegroundColor Green
    Start-ScheduledPipelineExecution
    
    Write-Host @"

🎉 SCRIPT EXECUTION COMPLETED SUCCESSFULLY!
==========================================
📊 All pipeline runs have been triggered according to schedule
📈 Monitor Grafana dashboard for real-time trend analysis
📋 Your research data collection is now complete
📚 Check the log file for detailed execution history: $LogFile

🔍 Next Steps:
1. Verify all pipelines completed successfully
2. Export data from Grafana for statistical analysis  
3. Prepare baseline summary for GitOps comparison phase

✅ Phase 2 Traditional CI/CD baseline collection complete!
==========================================

"@ -ForegroundColor Green
    
} catch {
    Write-Host "❌ Script execution failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📋 Check the log file for details: $LogFile" -ForegroundColor Yellow
    exit 1
}

# ===============================================
# USAGE INSTRUCTIONS
# ===============================================

<#
.SYNOPSIS
Automated Traditional CI/CD Pipeline Execution for Academic Research

.DESCRIPTION
This PowerShell script systematically triggers Traditional CI/CD pipeline runs
for ESI-SBA thesis research on Traditional CI/CD vs GitOps comparison.

.PARAMETER ProjectPath
Path to the microservices project directory
Default: C:\Users\hp\microservices-thesis\e-commerce-microservices-sample

.PARAMETER AppPath  
Relative path to the app.py file within the project
Default: users-cna-microservice\app.py

.PARAMETER StartVersion
Starting version number for incrementation
Default: 6.2.3

.PARAMETER TotalRuns
Total number of pipeline runs to execute
Default: 8

.PARAMETER IntervalMinutes
Minutes between scheduled runs (for reference only - uses fixed schedule)
Default: 45

.EXAMPLE
.\ScheduledPipelineExecution.ps1
Runs with default parameters

.EXAMPLE  
.\ScheduledPipelineExecution.ps1 -StartVersion "6.3.0" -TotalRuns 10
Starts from version 6.3.0 and schedules 10 runs

.NOTES
- Requires Git to be installed and configured
- Requires access to the GitHub repository
- Manual approval gates still require human intervention
- Monitor GitHub Actions for approval requests
- Check Grafana dashboard for real-time metrics
#>