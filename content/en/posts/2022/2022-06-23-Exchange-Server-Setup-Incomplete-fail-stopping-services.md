---
title: "Exchange Server Setup Incomplete but fails to complete"
subtitle: "Setup fails at 'Step 1 of 13: Stopping Services'"
date: 2022-06-23
contenttags: [exchange, exchange server setup, troubleshooting, powershell]
image: /assets/images/2022/2022-06-22_Exchange_Server_Incomplete_Installation_Detected_small.png
---

I had an issue with a broken Exchange Server 2016 CU23. Or rather it was not fully installed.
It was just a test environment, but I thought it would be useful or interesting to drill down on that issue.

I'll guide you through my troubleshooting steps / thought process.

[![Exchange Server 2016 CU23 Setup Assistant - Incomplete Installation Detected](/assets/images/2022/2022-06-22_Exchange_Server_Incomplete_Installation_Detected.png "Exchange Server 2016 CU23 Setup Assistant - Incomplete Installation Detected")](/assets/images/2022/2022-06-22_Exchange_Server_Incomplete_Installation_Detected.png)

## Try to continue Setup

First I tried to resume the setup. The setup fails early - at `Step 1 of 13: Stopping Services`.
[![Exchange Server 2016 CU23 Setup Assistant - Fails at Step 1 Stopping services](/assets/images/2022/2022-06-22_Exchange_Server_Setup_Fails_at_stopping_services.png "Exchange Server 2016 CU23 Setup Assistant - Fails at Step 1 Stopping services")](/assets/images/2022/2022-06-22_Exchange_Server_Setup_Fails_at_stopping_services.png)

The error message in detail:

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

Okay, so the setup tried to execute `ServiceControl.ps1`. Where is that script located...? I don't know right now, but I'll find out later.

## Check Exchange Server Setup Log

Let's first check the Exchange Server Setup Log, at `C:\ExchangeSetupLogs\ExchangeSetup.log`.
In the log there is some more context of the previously failed command. So the variable `$RoleRoles` (nice name) is certainly not empty:

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

## Check Start-PreFileCopy[...].ps1

The Setup also created a script to replicate that command. Neat! I navigated to the file at `C:\ExchangeSetupLogs\Start-PreFileCopy-20220622-0720250331374206211.ps1`.

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

I had to comment out one line which was just plaintext with the date/time (above `$roleList = [...]`). I then tried to manually run that script.
And surely I got the same error as the setup before, but with slightly more details. The error occurs in line 302 of `ServiceControl.ps1`. And now I also know where that `ServiceControl.ps1` script actually resided. Nice.

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

## Check ServiceControl.ps1

So `ServiceControl.ps1` resides in the Exchange Server `Bin`-directory. Well that's easy. Let's look at that script. Line 301/302 are:

```powershell
    $services = Get-ServiceToControl $Roles -Active
    [array]::Reverse($services)
```

So the reversing of `$services` fails. The error message from before told us the issue already: `Value cannot be null`. So is it really null? I've set a PowerShell Debugging Breakpoint with the PowerShell ISE to see for myself.

[![Exchange Server 2016 CU23 Setup - Debugging ServiceControl.ps1 with PowerShell ISE](/assets/images/2022/2022-06-22_Exchange_Server_setup_debug_servicecontrol_ps1.png "Exchange Server 2016 CU23 Setup - Debugging ServiceControl.ps1 with PowerShell ISE")](/assets/images/2022/2022-06-22_Exchange_Server_setup_debug_servicecontrol_ps1.png)

OKAY, it is empty. What did I even expect here?
Then I looked at the definition of the function `Get-ServiceToControl`, which starts at line 105.

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

That function is using the variable `$script:servicesToControl`. That again is defined starting at line 56.

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

Ah okay, these are the actual Windows Service names for each Exchange Server Role. But that doesn't really help now. So one step back to `Get-ServiceToControl`.
Oh yeah wait. So if `$Active` is set, only Windows Services that are not in the `Status` of `Stopped` are getting returned. Because of the failed Setup, most Exchange Services are `Disabled` and surely none are running.

[![Exchange Server 2016 - Services are not running](/assets/images/2022/2022-06-22_Exchange_Server_Services_are_stopped.png "Exchange Server 2016 - Services are not running")](/assets/images/2022/2022-06-22_Exchange_Server_Services_are_stopped.png)

So... Could it be that easy? I imagine: If atleast **ONE** Exchange Service was running, `Get-ServiceToControl` would **NOT** return an empty response, so the `[array]::Reverse($services)` would **NOT** fail. Then the procedure of "Stopping Exchange Services" should be deemed successful - right?

## Manually starting an Exchange Service

So opened `services.msc` to enable and start the `Microsoft Exchange Active Directory Topology` Service (`MSExchangeADTopology`).

[![Exchange Server 2016 - Enabling a service manually in services.msc](/assets/images/2022/2022-06-22_Exchange_Server_enable_service.png "Exchange Server 2016 - Enabling a service manually in services.msc")](/assets/images/2022/2022-06-22_Exchange_Server_enable_service.png)

## Re-run Start-PreFileCopy[...].ps1

I tried to re-run `Start-PreFileCopy-20220622-0720250331374206211.ps1`. It actually failed now with a different error. But that looks like missing dependencies/functions from the setup environment. Nothing too concerning.

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

## Re-run Exchange Server Setup

So it just might work now, if running from within the Setup context. So I tried. Already looked promising after a bit, because it's now at Step 2. I went to take break.

[![Exchange Server 2016 CU23 Setup Assistant - Step 2 Copy Exchange Files running](/assets/images/2022/2022-06-22_Exchange_Server_setup_copy_exchange_files.png "Exchange Server 2016 CU23 Setup Assistant - Step 2 Copy Exchange Files running")](/assets/images/2022/2022-06-22_Exchange_Server_setup_copy_exchange_files.png)

When I came back, there was no Exchange Setup running anymore. Weird. Did it crash? I checked the `C:\ExchangeSetupLogs\ExchangeSetup.log` file again. Looks good now:

```log
[06/22/2022 10:07:00.0062] [2] Install is complete.  Server state has been set to Active.
[06/22/2022 10:07:00.0063] [2] Ending processing Write-ExchangeSetupLog
[06/22/2022 10:07:00.0064] [1] Finished executing component tasks.
[06/22/2022 10:07:00.0068] [1] Ending processing Start-PostSetup
[06/22/2022 10:07:00.0102] [0] CurrentResult setupbase.maincore:396: 0
[06/22/2022 10:07:00.0103] [0] End of Setup
[06/22/2022 10:07:00.0103] [0] **********************************************
```

## Verify

First I looked if the Services are now enabled and running as they should. Looks good.

[![Exchange Server 2016 - Services are running again](/assets/images/2022/2022-06-22_Exchange_Server_Services_are_running.png "Exchange Server 2016 - Services are running again")](/assets/images/2022/2022-06-22_Exchange_Server_Services_are_running.png)

Then I ran the Exchange Management Shell to run `Get-ExchangeServer`. Looks good aswell.

[![Exchange Server 2016 - Exchange Management Shell is running](/assets/images/2022/2022-06-22_Exchange_Server_management_shell_working.png "Exchange Server 2016 - Exchange Management Shell is running")](/assets/images/2022/2022-06-22_Exchange_Server_management_shell_working.png)

## Conclusion

1.  Really weird how that check is implemented. IMO Microsoft could improve the Setup Experience here, if the Setup checks if there are any Services that are running and actually need to get stopped. Instead it crashes now, if there are no running Exchange Services.

1.  I mean afterwards it always seems easy and obvious. But maybe I could've gotten to the goal faster if I had drawn a direct conclusion of the facts

    -   Setup fails at the step "Stopping Services"
    -   No Exchange Services are running
    -   = Thus no Services can get **stopped**

### Sidenote

In the Microsoft Exchange context `Cafe` stands for "Client Access Front End". I was somehow not aware of that abbreviation.
