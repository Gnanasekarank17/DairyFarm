#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Run this script ONCE as Administrator to enable TCP on SQLEXPRESS port 1433
    and open the Windows Firewall.

    Right-click PowerShell → "Run as administrator"
    Then: .\setup-sqlserver-tcp.ps1
#>

Write-Host "=== Dairy Farm - SQL Server TCP Setup ===" -ForegroundColor Cyan

# 1. Enable TCP via WMI
$tcp = Get-WmiObject -Namespace "root\Microsoft\SqlServer\ComputerManagement17" `
    -Class "ServerNetworkProtocol" `
    -Filter "InstanceName='SQLEXPRESS' AND ProtocolName='Tcp'"
if ($tcp) {
    $tcp.SetEnable() | Out-Null
    Write-Host "[OK] TCP protocol enabled on SQLEXPRESS" -ForegroundColor Green
} else {
    Write-Warning "Could not find TCP protocol via WMI"
}

# 2. Set fixed port 1433 (clear dynamic port)
$portProp = Get-WmiObject -Namespace "root\Microsoft\SqlServer\ComputerManagement17" `
    -Class "ServerNetworkProtocolProperty" `
    -Filter "InstanceName='SQLEXPRESS' AND IPAddressName='IPAll' AND PropertyName='TcpPort'"
if ($portProp) { $portProp.SetStringValue("1433") | Out-Null; Write-Host "[OK] TcpPort set to 1433" -ForegroundColor Green }

$dynProp = Get-WmiObject -Namespace "root\Microsoft\SqlServer\ComputerManagement17" `
    -Class "ServerNetworkProtocolProperty" `
    -Filter "InstanceName='SQLEXPRESS' AND IPAddressName='IPAll' AND PropertyName='TcpDynamicPorts'"
if ($dynProp) { $dynProp.SetStringValue("") | Out-Null; Write-Host "[OK] Dynamic port cleared" -ForegroundColor Green }

# 3. Enable Mixed Authentication (SQL + Windows)
$regPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.SQLEXPRESS\MSSQLServer"
Set-ItemProperty -Path $regPath -Name "LoginMode" -Value 2
Write-Host "[OK] Mixed authentication (SQL + Windows) enabled" -ForegroundColor Green

# 4. Firewall rules
$rules = @(
    @{ Name="SQL Server 1433 TCP"; Protocol="TCP"; Port=1433 },
    @{ Name="SQL Browser 1434 UDP"; Protocol="UDP"; Port=1434 }
)
foreach ($rule in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if (-not $existing) {
        New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound `
            -Protocol $rule.Protocol -LocalPort $rule.Port -Action Allow -Profile Any | Out-Null
        Write-Host "[OK] Firewall rule created: $($rule.Name)" -ForegroundColor Green
    } else {
        Write-Host "[OK] Firewall rule already exists: $($rule.Name)" -ForegroundColor Yellow
    }
}

# 5. Start SQL Browser
$browser = Get-Service -Name "SQLBrowser" -ErrorAction SilentlyContinue
if ($browser) {
    Set-Service -Name "SQLBrowser" -StartupType Automatic
    Start-Service -Name "SQLBrowser" -ErrorAction SilentlyContinue
    Write-Host "[OK] SQL Browser service started" -ForegroundColor Green
}

# 6. Restart SQLEXPRESS
Write-Host "Restarting SQL Server Express..." -ForegroundColor Yellow
Restart-Service -Name "MSSQL`$SQLEXPRESS" -Force
Start-Sleep -Seconds 6

# 7. Verify
$listening = netstat -ano | Select-String ":1433 "
if ($listening) {
    Write-Host "`n[SUCCESS] SQL Server is now listening on port 1433!" -ForegroundColor Green
    Write-Host $listening
} else {
    Write-Warning "Port 1433 not detected - check SQL Server error log"
}

Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "You can now run: docker-compose up -d" -ForegroundColor White
