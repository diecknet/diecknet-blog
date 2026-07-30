---
comments: true
aliases:
    - exchange-server-setup-incomplete-fail-stopping-services
slug: Exchange-Server-Setup-Incomplete-fail-stopping-services
title: "Exchange-Server-Setup unvollständig und Abschluss schlägt fehl"
subtitle: "Setup scheitert bei 'Schritt 1 von 13: Dienste werden beendet'"
date: 2022-06-23
tags: [exchange, exchange server setup, troubleshooting, powershell]
cover:
    image: /images/2022/2022-06-22_Exchange_Server_Incomplete_Installation_Detected_small.png
---

Ich habe ein Problem mit einem kaputten Exchange Server 2016 CU23 gehabt. Oder eher: Er ist nicht vollständig installiert gewesen.
Es ist nur eine Testumgebung gewesen, aber ich habe gedacht, dass es nützlich oder interessant gewesen ist, bei diesem Problem tiefer einzusteigen.

Ich habe euch durch meine Troubleshooting-Schritte bzw. meinen Denkprozess geführt.

[![Exchange Server 2016 CU23 Setup Assistant - Incomplete Installation Detected](/images/2022/2022-06-22_Exchange_Server_Incomplete_Installation_Detected.png "Exchange Server 2016 CU23 Setup Assistant - Incomplete Installation Detected")](/images/2022/2022-06-22_Exchange_Server_Incomplete_Installation_Detected.png)

## Versuch, das Setup fortzusetzen

Zuerst habe ich versucht, das Setup fortzusetzen. Das Setup ist früh fehlgeschlagen – bei `Step 1 of 13: Stopping Services`.
[![Exchange Server 2016 CU23 Setup Assistant - Fails at Step 1 Stopping services](/images/2022/2022-06-22_Exchange_Server_Setup_Fails_at_stopping_services.png "Exchange Server 2016 CU23 Setup Assistant - Fails at Step 1 Stopping services")](/images/2022/2022-06-22_Exchange_Server_Setup_Fails_at_stopping_services.png)

Die Fehlermeldung im Detail:

```log
Error:
The following error was generated when "$error.Clear();
          $roleList = $RoleRoles.Replace('Role','').Split(',');

          if($roleList -contains 'LanguagePacks')
          {
            & $RoleBinPath\ServiceControl.ps1 Save
            & $RoleBinPath\ServiceControl.ps1 DisableServices $roleList;
            & $RoleBinPath\ServiceControl.ps1 Stop $roleList;

          };
        " was run: "System.Management.Automation.MethodInvocationException: Exception calling "Reverse" with "1" argument(s): "Value cannot be null.
Parameter name: array" ---> System.ArgumentNullException: Value cannot be null.
Parameter name: array
   at System.Array.Reverse(Array array)
   at CallSite.Target(Closure , CallSite , Type , Object )
   --- End of inner exception stack trace ---
   at System.Management.Automation.ExceptionHandlingOps.ConvertToMethodInvocationException(Exception exception, Type typeToThrow, String methodName, Int32 numArgs, MemberInfo memberInfo)
   at CallSite.Target(Closure , CallSite , Type , Object )
   at System.Dynamic.UpdateDelegates.UpdateAndExecute2[T0,T1,TRet](CallSite site, T0 arg0, T1 arg1)
   at System.Management.Automation.Interpreter.DynamicInstruction`3.Run(InterpretedFrame frame)
   at System.Management.Automation.Interpreter.EnterTryCatchFinallyInstruction.Run(InterpretedFrame frame)".
```

Okay, das Setup hat also versucht, `ServiceControl.ps1` auszuführen. Wo dieses Skript gelegen hat ... habe ich in dem Moment nicht gewusst, aber ich habe es später herausgefunden.

## Exchange Server Setup Log prüfen

Zuerst haben wir das Exchange Server Setup Log unter `C:\ExchangeSetupLogs\ExchangeSetup.log` geprüft.
Im Log hat es mehr Kontext zum zuvor fehlgeschlagenen Befehl gegeben. Die Variable `$RoleRoles` ist also sicher nicht leer gewesen:

```log
[06/22/2022 07:20:25.0377] [1] Executing: $RoleRoles = 'LanguagePacksRole,BridgeheadRole,ClientAccessRole,UnifiedMessagingRole,MailboxRole,FrontendTransportRole,CafeRole'
[...]
[06/22/2022 07:20:25.0383] [1] Executing:
$roleList = $RoleRoles.Replace('Role','').Split(',');

          if($roleList -contains 'LanguagePacks')
          {
            & $RoleBinPath\ServiceControl.ps1 Save
            & $RoleBinPath\ServiceControl.ps1 DisableServices $roleList;
            & $RoleBinPath\ServiceControl.ps1 Stop $roleList;

          };
[...]
[06/22/2022 07:20:25.0332] [1] Writing informational script to 'C:\ExchangeSetupLogs\Start-PreFileCopy-20220622-0720250331374206211.ps1'
```

## Start-PreFileCopy[...].ps1 prüfen

Das Setup hat außerdem ein Skript erstellt, um diesen Befehl nachzustellen. Praktisch! Ich bin zur Datei unter `C:\ExchangeSetupLogs\Start-PreFileCopy-20220622-0720250331374206211.ps1` navigiert.

```powershell
# Default Start steps for PreFileCopy.
# Programmatically generated on 6/22/2022 7:20:25 AM.
#
# Variable Declarations
#

$RoleBinPath = 'X:\ExchangeServer\Bin'
$RoleDatacenterPath = 'X:\ExchangeServer\Datacenter'
$RoleDatacenterServiceEndpointABCHContactService = '<ServiceEndpoint><Url>http://pvt-contacts.msn.com/abservice/abservice.asmx</Url></ServiceEndpoint>'
$RoleDatacenterServiceEndpointDomainPartnerManageDelegation = '<ServiceEndpoint><Url>https://domains.live.com/service/managedelegation.asmx</Url></ServiceEndpoint>'
$RoleDatacenterServiceEndpointDomainPartnerManageDelegation2 = '<ServiceEndpoint><Url>https://domains.live.com/service/managedelegation2.asmx</Url></ServiceEndpoint>'
$RoleDatacenterServiceEndpointLiveFederationMetadata = '<ServiceEndpoint><Url>https://nexus.passport.com/FederationMetadata/2006-12/FederationMetadata.xml</Url></ServiceEndpoint>'
$RoleDatacenterServiceEndpointLiveGetUserRealm = '<ServiceEndpoint><Url>https://login.live.com/GetUserRealm.srf</Url></ServiceEndpoint>'
$RoleDatacenterServiceEndpointLiveServiceLogin2 = '<ServiceEndpoint><Url>https://login.live.com/RST2.srf</Url></ServiceEndpoint>'
$RoleDatacenterServiceEndpointMsoFederationMetadata = '<ServiceEndpoint><Url>https://nexus.microsoftonline-p.com/FederationMetadata/2006-12/FederationMetadata.xml</Url></ServiceEndpoint>'
$RoleInstallationMode = 'Install'
$RoleInstallPath = 'X:\ExchangeServer\'
$RoleInvocationID = '20220622-0720250331374206211'
$RoleIsDatacenter = $False
$RoleIsDatacenterDedicated = $False
$RoleIsFfo = $False
$RoleIsPartnerHosted = $False
$RoleLoggingPath = 'X:\ExchangeServer\Logging'
$RoleProductPlatform = 'amd64'
$RoleRoles = 'LanguagePacksRole,BridgeheadRole,ClientAccessRole,UnifiedMessagingRole,MailboxRole,FrontendTransportRole,CafeRole'
$RoleSetupLoggingPath = 'C:\ExchangeSetupLogs'
$RoleTargetVersion = '15.01.2507.006'

#
# Component tasks
#
# Tasks for 'All Roles Pre File Copy' component
# [ID = AllRolesPreFileCopyComponent___2f7e3804a2b340c69e930798211fb8fd, Wt = 10, isFatal = True] "Stopping services"
#6/22/2022 7:20:25 AM:
$roleList = $RoleRoles.Replace('Role','').Split(',');

          if($roleList -contains 'LanguagePacks')
          {
            & $RoleBinPath\ServiceControl.ps1 Save
            & $RoleBinPath\ServiceControl.ps1 DisableServices $roleList;
            & $RoleBinPath\ServiceControl.ps1 Stop $roleList;

          };
```

Ich habe eine Zeile auskommentieren müssen, die nur Klartext mit Datum/Uhrzeit gewesen ist (oberhalb von `$roleList = [...]`). Danach habe ich versucht, das Skript manuell auszuführen.
Und tatsächlich habe ich denselben Fehler wie zuvor im Setup erhalten, aber mit etwas mehr Details. Der Fehler ist in Zeile 302 von `ServiceControl.ps1` aufgetreten. Und jetzt habe ich auch gewusst, wo `ServiceControl.ps1` tatsächlich gelegen hat. Nice.

```powershell
PS F:\Setup\ServerRoles\Common> C:\ExchangeSetupLogs\Start-PreFileCopy-20220622-0720250331374206211.ps1
Exception calling "Reverse" with "1" argument(s): "Value cannot be null.
Parameter name: array"
At X:\ExchangeServer\Bin\ServiceControl.ps1:302 char:2
+     [array]::Reverse($services)
+     ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [], MethodInvocationException
    + FullyQualifiedErrorId : ArgumentNullException
```

## ServiceControl.ps1 prüfen

`ServiceControl.ps1` hat also im Exchange-Server-`Bin`-Verzeichnis gelegen. Das ist einfach gewesen. Also haben wir in das Skript geschaut. Zeile 301/302 sind:

```powershell
    $services = Get-ServiceToControl $Roles -Active
    [array]::Reverse($services)
```

Das Umdrehen von `$services` ist also fehlgeschlagen. Die Fehlermeldung von vorher hat uns das Problem schon gesagt: `Value cannot be null`. Ist es wirklich null gewesen? Ich habe einen PowerShell-Debugging-Breakpoint mit der PowerShell ISE gesetzt, um es selbst zu sehen.

[![Exchange Server 2016 CU23 Setup - Debugging ServiceControl.ps1 with PowerShell ISE](/images/2022/2022-06-22_Exchange_Server_setup_debug_servicecontrol_ps1.png "Exchange Server 2016 CU23 Setup - Debugging ServiceControl.ps1 with PowerShell ISE")](/images/2022/2022-06-22_Exchange_Server_setup_debug_servicecontrol_ps1.png)

OKAY, es ist leer gewesen. Was habe ich hier überhaupt erwartet?
Danach habe ich mir die Definition der Funktion `Get-ServiceToControl` angesehen, die bei Zeile 105 gestartet ist.

```powershell
# Get-ServiceToControl
#  Returns list of service(s) to control.
#  Arguments:
#   $Roles - list of Exchange roles.
#   $Active - indicates that only non-stopped service should be returned.
# Returns:
#  Service(s) to control.
function Get-ServiceToControl ([string[]]$Roles, [switch]$Active)
{
    # 1. Populate full list of services for all roles.
    & {
        # 1.a. Get common ones.
        if (($Roles -notcontains 'Critical') -and ($script:servicesToControl['Common']))
        {
            $script:servicesToControl['Common']
        }
        # 1.b. Get services for each role.
        $Roles |
        foreach {
            if ($script:servicesToControl[$_])
            {
                $script:servicesToControl[$_]
            }
        }
    } |
    # 2. Eliminate duplicates.
    sort | unique |
    # 3. Filter only those which are installed
    # and (optionally) running.
    where {
        $serviceName = $_
        # 3.a. Check if installed.
        # Note the trick of requesting by pattern prevents Get-Service
        # from failing in case service is not installed.
        Get-Service "$serviceName*" |
        ?{$_.Name -eq $serviceName} |
        # 3.b. If $Active is specified, check that service is not stopped.
        ?{!$Active -or $_.Status -ne 'Stopped'}
    }
}
```

Diese Funktion hat die Variable `$script:servicesToControl` genutzt. Diese ist wiederum ab Zeile 56 definiert gewesen.

```powershell
$script:servicesToControl = @{}
$script:servicesToControl['Common']             = @( 'WinMgmt', 'RemoteRegistry', 'HealthService', 'OnePoint', 'MOM', 'OMCFG', 'pla' )
$script:servicesToControl['ClientAccess']       = @( 'MSExchangeMonitoring', 'MSExchangeIMAP4', 'MSExchangePOP3' , 'MSExchangeADTopology' ,'MSExchangeTopologyService', 'MSExchangeFDS', 'IISAdmin', 'MSExchangeServiceHost', 'W3Svc', 'MSExchangeRPC', 'MSExchangeIMAP4BE', 'MSExchangePOP3BE', 'MSExchangeMailboxReplication', 'MSExchangeFBA', 'MSExchangeProtectedServiceHost', 'MSExchangeDiagnostics', 'MSExchangeHM', 'MSExchangeHMRecovery')
$script:servicesToControl['Gateway']            = @( 'MSExchangeMonitoring', 'WorkerService', 'MSExchangeTransport', 'MSExchangeTransportLogSearch', 'MSExchangeEdgeSync', 'MSExchangeAntispamUpdate', 'MSExchangeEdgeCredential', 'MSExchangeServiceHost', 'MSExchangeHM', 'MSExchangeHMRecovery', 'MSExchangeDiagnostics')
$script:servicesToControl['Mailbox']            = @( 'MSExchangeMonitoring', 'IISAdmin', 'MSExchangeIS', 'MSExchangeMailboxAssistants', 'MSFTESQL-Exchange', 'MSExchangeThrottling', 'MSExchangeADTopology' ,'MSExchangeTopologyService', 'MSExchangeRepl', 'MSExchangeDagMgmt', 'MSExchangeWatchDog', 'MSExchangeTransportLogSearch', 'MSExchangeRPC', 'MSExchangeServiceHost', 'W3Svc', 'HTTPFilter', 'wsbexchange', 'MSExchangeTransportSyncManagerSvc', 'MSExchangeFastSearch', 'hostcontrollerservice', 'SearchExchangeTracing', 'MSExchangeSubmission', 'MSExchangeDelivery', 'MSExchangeMigrationWorkflow', 'MSExchangeDiagnostics', 'MSExchangeProcessUtilizationManager', 'MSExchangeHM', 'MSExchangeHMRecovery', 'MSExchangeInferenceService')
$script:servicesToControl['Bridgehead']         = @( 'MSExchangeMonitoring', 'AdminService', 'FMS', 'MSExchangeAntimalwareSvc', 'MSExchangeAntimalwareUpdateSvc', 'MSExchangeTransport' , 'MSExchangeADTopology' ,'MSExchangeTopologyService',  'MSExchangeEdgeSync', 'MSExchangeProtectedServiceHost', 'MSExchangeTransportLogSearch', 'MSExchangeTransportStreamingOptics', 'MSExchangeAntispamUpdate', 'MSExchangeServiceHost', 'hostcontrollerservice', 'SearchExchangeTracing', 'W3Svc', 'shm', 'MSMessageTracingClient', 'MSExchangeFileUpload', 'MSExchangeDiagnostics', 'MSExchangeProcessUtilizationManager', 'MSExchangeHM', 'MSExchangeHMRecovery', 'MSExchangeStreamingOptics')
$script:servicesToControl['UnifiedMessaging']   = @( 'MSExchangeMonitoring', 'Exchange UM Service' , 'MSExchangeADTopology' ,'MSExchangeTopologyService',  'MSExchangeFDS', 'MSExchangeUM', 'MSExchangeServiceHost', 'W3Svc', 'MSExchangeDiagnostics', 'MSExchangeHM', 'MSExchangeHMRecovery')
$script:servicesToControl['FrontendTransport']  = @( 'MSExchangeMonitoring', 'AdminService', 'MSExchangeTransport' , 'MSExchangeADTopology' ,'MSExchangeTopologyService',  'MSExchangeEdgeSync', 'MSExchangeProtectedServiceHost', 'MSExchangeTransportLogSearch', 'MSExchangeAntispamUpdate', 'MSExchangeServiceHost', 'W3Svc', 'MSExchangeFrontendTransport', 'shm', 'MSMessageTracingClient', 'MSExchangeFileUpload', 'MSExchangeDiagnostics', 'MSExchangeProcessUtilizationManager', 'MSExchangeHM', 'MSExchangeHMRecovery')
$script:servicesToControl['Cafe']               = @( 'MSExchangeMonitoring', 'MSExchangeDiagnostics', 'MSExchangeProcessUtilizationManager', 'MSExchangeHM', 'MSExchangeHMRecovery')
$script:servicesToControl['Monitoring']         = @( 'MSExchangeCAMOMConnector', 'MSExchangeMonitoringCorrelation' )
$script:servicesToControl['CentralAdmin']       = @( 'MSExchangeCentralAdmin', 'MSExchangeMonitoringCorrelation', 'WDSServer', 'MSDTC', 'MSExchangeDiagnostics', 'MSExchangeHM', 'MSExchangeHMRecovery')
$script:servicesToControl['OSP']                = @( 'IISAdmin', 'W3Svc','MSExchangeADTopology' ,'MSExchangeTopologyService', 'MSExchangeMonitoring', 'MSExchangeHM', 'MSExchangeHMRecovery')
$script:servicesToControl['FfoWebService']      = @( 'MSExchangeProcessUtilizationManager','MSExchangeADTopology','MSExchangeProtectedServiceHost','MSExchangeServiceHost','W3Svc')

$script:servicesToControl['LanguagePacks']      = $script:servicesToControl['AdminTools'] +
                                                  $script:servicesToControl['ClientAccess'] +
                                                  $script:servicesToControl['Gateway'] +
                                                  $script:servicesToControl['Mailbox'] +
                                                  $script:servicesToControl['Bridgehead'] +
                                                  $script:servicesToControl['UnifiedMessaging'] +
                                                  $script:servicesToControl['Cafe'] +
                                                  $script:servicesToControl['FrontendTransport'] +
                                                  $script:servicesToControl['OSP']


# List of critical services required for prereqs.
$script:servicesToControl['Critical']           = @( 'WinMgmt', 'RemoteRegistry', 'W3Svc', 'IISAdmin' )
```

Ah okay, das sind die tatsächlichen Windows-Service-Namen für jede Exchange-Server-Rolle gewesen. Das hat uns hier aber noch nicht direkt geholfen. Also einen Schritt zurück zu `Get-ServiceToControl`.
Oh ja, warte. Wenn `$Active` gesetzt gewesen ist, sind nur Windows-Services zurückgegeben worden, die nicht den Status `Stopped` gehabt haben. Wegen des fehlgeschlagenen Setups sind die meisten Exchange-Services `Disabled` gewesen, und sicher ist keiner gelaufen.

[![Exchange Server 2016 - Services are not running](/images/2022/2022-06-22_Exchange_Server_Services_are_stopped.png "Exchange Server 2016 - Services are not running")](/images/2022/2022-06-22_Exchange_Server_Services_are_stopped.png)

Also ... kann es so einfach gewesen sein? Ich habe es mir so vorgestellt: Wenn wenigstens **EIN** Exchange-Service gelaufen wäre, hätte `Get-ServiceToControl` **KEINE** leere Antwort geliefert, also wäre `[array]::Reverse($services)` **NICHT** fehlgeschlagen. Dann hätte der Schritt „Stopping Exchange Services“ als erfolgreich gewertet werden sollen – richtig?

## Einen Exchange-Service manuell starten

Also habe ich `services.msc` geöffnet, um den Dienst `Microsoft Exchange Active Directory Topology` (`MSExchangeADTopology`) zu aktivieren und zu starten.

[![Exchange Server 2016 - Enabling a service manually in services.msc](/images/2022/2022-06-22_Exchange_Server_enable_service.png "Exchange Server 2016 - Enabling a service manually in services.msc")](/images/2022/2022-06-22_Exchange_Server_enable_service.png)

## Start-PreFileCopy[...].ps1 erneut ausführen

Ich habe versucht, `Start-PreFileCopy-20220622-0720250331374206211.ps1` erneut auszuführen. Dieses Mal ist es mit einem anderen Fehler fehlgeschlagen. Das hat aber nach fehlenden Abhängigkeiten/Funktionen aus der Setup-Umgebung ausgesehen. Nichts allzu Kritisches.

```powershell
Stop-SetupService : The term 'Stop-SetupService' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.
At X:\ExchangeServer\Bin\ServiceControl.ps1:342 char:3
+         Stop-SetupService -ServiceName $serviceName -ev script:servic ...
+         ~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (Stop-SetupService:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

Cannot index into a null array.
At X:\ExchangeServer\Bin\ServiceControl.ps1:343 char:7
+         if( $script:serviceControlError[0] -ne $null )
+             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (:) [], RuntimeException
    + FullyQualifiedErrorId : NullArray
```

## Exchange Server Setup erneut ausführen

Also könnte es jetzt innerhalb des Setup-Kontexts einfach funktionieren. Das habe ich versucht. Nach kurzer Zeit hat es schon gut ausgesehen, weil es jetzt bei Schritt 2 gewesen ist. Ich habe eine Pause gemacht.

[![Exchange Server 2016 CU23 Setup Assistant - Step 2 Copy Exchange Files running](/images/2022/2022-06-22_Exchange_Server_setup_copy_exchange_files.png "Exchange Server 2016 CU23 Setup Assistant - Step 2 Copy Exchange Files running")](/images/2022/2022-06-22_Exchange_Server_setup_copy_exchange_files.png)

Als ich zurückgekommen bin, ist kein Exchange Setup mehr gelaufen. Seltsam. Ist es abgestürzt? Ich habe die Datei `C:\ExchangeSetupLogs\ExchangeSetup.log` erneut geprüft. Es hat jetzt gut ausgesehen:

```log
[06/22/2022 10:07:00.0062] [2] Install is complete.  Server state has been set to Active.
[06/22/2022 10:07:00.0063] [2] Ending processing Write-ExchangeSetupLog
[06/22/2022 10:07:00.0064] [1] Finished executing component tasks.
[06/22/2022 10:07:00.0068] [1] Ending processing Start-PostSetup
[06/22/2022 10:07:00.0102] [0] CurrentResult setupbase.maincore:396: 0
[06/22/2022 10:07:00.0103] [0] End of Setup
[06/22/2022 10:07:00.0103] [0] **********************************************
```

## Verifizieren

Zuerst habe ich geprüft, ob die Services jetzt wie erwartet aktiviert gewesen sind und gelaufen sind. Hat gut ausgesehen.

[![Exchange Server 2016 - Services are running again](/images/2022/2022-06-22_Exchange_Server_Services_are_running.png "Exchange Server 2016 - Services are running again")](/images/2022/2022-06-22_Exchange_Server_Services_are_running.png)

Danach habe ich die Exchange Management Shell gestartet, um `Get-ExchangeServer` auszuführen. Hat ebenfalls gut ausgesehen.

[![Exchange Server 2016 - Exchange Management Shell is running](/images/2022/2022-06-22_Exchange_Server_management_shell_working.png "Exchange Server 2016 - Exchange Management Shell is running")](/images/2022/2022-06-22_Exchange_Server_management_shell_working.png)

## Fazit

1.  Es ist wirklich seltsam gewesen, wie dieser Check implementiert worden ist. IMO hätte Microsoft das Setup-Erlebnis hier verbessern können, wenn das Setup geprüft hätte, ob überhaupt Services gelaufen sind, die tatsächlich gestoppt werden mussten. Stattdessen ist es abgestürzt, wenn keine Exchange-Services gelaufen sind.

1.  Im Nachhinein ist es immer leicht und offensichtlich gewesen. Aber vielleicht wäre ich schneller zum Ziel gekommen, wenn ich direkt diese Schlussfolgerung gezogen hätte:

    -   Das Setup ist beim Schritt „Stopping Services“ fehlgeschlagen
    -   Es sind keine Exchange-Services gelaufen
    -   = Also haben keine Services **gestoppt** werden können

### Nebenbemerkung

Im Microsoft-Exchange-Kontext hat `Cafe` für „Client Access Front End“ gestanden. Diese Abkürzung ist mir vorher irgendwie nicht bewusst gewesen.
