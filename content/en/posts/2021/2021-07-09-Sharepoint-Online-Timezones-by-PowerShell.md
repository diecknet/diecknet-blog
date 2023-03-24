---
comments: true
aliases:
    - sharepoint-online-timezones-by-powershell
slug: Sharepoint-Online-Timezones-by-PowerShell
title: Retrieve the Timezone of a Sharepoint Online Site using PowerShell
tags:
    [
        sharepoint online,
        timezone,
        powershell,
        Microsoft.Online.SharePoint.PowerShell
    ]
cover:
    image: /images/2021/2021-07-09_ConvertSPOSiteTimezone.png
imageAlt: Executing PowerShell cmdlets to retrieve the Timezone of a Sharepoint Online site in a human readable form
date: 2021-07-09
---

I've been looking for a way to retrieve the Timezone setting of a Sharepoint Online Site via PowerShell. Apparently there is not much good info publicly available. I looked for a way to use with the [standard SPO PowerShell module](https://docs.microsoft.com/en-us/powershell/sharepoint/sharepoint-online/connect-sharepoint-online?view=sharepoint-ps) named Microsoft.Online.SharePoint.PowerShell.
  
There are some infos online about using the PNPOnline Module, but that was not practical in my case. There are even some really annoying articles out, that claim to to provide a PowerShell way. But instead of retrieving the actual Timezone setting of a SPO site, they retrieve all available Timezones and then overwrite the current timezone with a valid one. Worst thing: They import Sharepoint .dll files, use plaintext authentication and use Client Context Object/CSOM (Microsoft.SharePoint.Client.ClientContext). 
😵 Oof.

## TL;DR - here is the PowerShell code

Here you go.

```powershell
try {
# trying to retrieve regional settings of $SPOSite
    $regionalSettings = Get-SPOSiteScriptFromWeb -WebUrl $SPOSite.Url -IncludeRegionalSettings | ConvertFrom-Json
    $timezoneID = $regionalSettings.actions.timeZone
} catch {
    # failback to 0 if not found
    $timezoneID = 0
}       
```

I assume you are already connected to SPO by `Connect-SPOService`. The return value of `Get-SPOSiteScriptFromWeb` is a JSON String, which you can convert to an object by `ConvertFrom-Json`. The raw JSON looks like this:

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/site-design-script-actions.schema.json",
  "actions": [
    {
      "verb": "setRegionalSettings",
      "timeZone": 4,
      "locale": 1031,
      "sortOrder": 25,
      "hourFormat": "24"
    }
  ]
}
```

## Convert SPO Timezone Code to human readable string

Yes, I also made something for that 😎. [Also available as a Github Gist.](https://gist.github.com/diecknet/c4fbefd8fc3fdeb965b70baefe9cee53)

```powershell
function Convert-SPOTimezoneToString(
# ID of a SPO Timezone
[int]$ID
) {
<#
.SYNOPSIS
Convert a Sharepoint Online Time zone ID to a human readable string.

.NOTES
By Andreas Dieckmann - https://diecknet.de
Timezone IDs according to https://docs.microsoft.com/en-us/dotnet/api/microsoft.sharepoint.spregionalsettings.timezones?view=sharepoint-server#Microsoft_SharePoint_SPRegionalSettings_TimeZones

Licensed under MIT License
Copyright 2021 Andreas Dieckmann

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

.EXAMPLE
Convert-SPOTimezoneToString 14
(UTC-09:00) Alaska

.LINK
https://diecknet.de/en/2021/07/09/Sharepoint-Online-Timezones-by-PowerShell/
#>

    $timezoneIDs = @{
        39="(UTC-12:00) International Date Line West";
        95="(UTC-11:00) Coordinated Universal Time-11";
        15="(UTC-10:00) Hawaii";
        14="(UTC-09:00) Alaska";
        78="(UTC-08:00) Baja California";
        13="(UTC-08:00) Pacific Time (US and Canada)";
        38="(UTC-07:00) Arizona";
        77="(UTC-07:00) Chihuahua, La Paz, Mazatlan";
        12="(UTC-07:00) Mountain Time (US and Canada)";
        55="(UTC-06:00) Central America";
        11="(UTC-06:00) Central Time (US and Canada)";
        37="(UTC-06:00) Guadalajara, Mexico City, Monterrey";
        36="(UTC-06:00) Saskatchewan";
        35="(UTC-05:00) Bogota, Lima, Quito";
        10="(UTC-05:00) Eastern Time (US and Canada)";
        34="(UTC-05:00) Indiana (East)";
        88="(UTC-04:30) Caracas";
        91="(UTC-04:00) Asuncion";
        9="(UTC-04:00) Atlantic Time (Canada)";
        81="(UTC-04:00) Cuiaba";
        33="(UTC-04:00) Georgetown, La Paz, Manaus, San Juan";
        28="(UTC-03:30) Newfoundland";
        8="(UTC-03:00) Brasilia";
        85="(UTC-03:00) Buenos Aires";
        32="(UTC-03:00) Cayenne, Fortaleza";
        60="(UTC-03:00) Greenland";
        90="(UTC-03:00) Montevideo";
        103="(UTC-03:00) Salvador";
        65="(UTC-03:00) Santiago";
        96="(UTC-02:00) Coordinated Universal Time-02";
        30="(UTC-02:00) Mid-Atlantic";
        29="(UTC-01:00) Azores";
        53="(UTC-01:00) Cabo Verde";
        86="(UTC) Casablanca";
        93="(UTC) Coordinated Universal Time";
        2="(UTC) Dublin, Edinburgh, Lisbon, London";
        31="(UTC) Monrovia, Reykjavik";
        4="(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna";
        6="(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague";
        3="(UTC+01:00) Brussels, Copenhagen, Madrid, Paris";
        57="(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb";
        69="(UTC+01:00) West Central Africa";
        83="(UTC+01:00) Windhoek";
        79="(UTC+02:00) Amman";
        5="(UTC+02:00) Athens, Bucharest, Istanbul";
        80="(UTC+02:00) Beirut";
        49="(UTC+02:00) Cairo";
        98="(UTC+02:00) Damascus";
        50="(UTC+02:00) Harare, Pretoria";
        59="(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius";
        101="(UTC+02:00) Istanbul";
        27="(UTC+02:00) Jerusalem";
        7="(UTC+02:00) Minsk (old)";
        104="(UTC+02:00) E. Europe";
        100="(UTC+02:00) Kaliningrad (RTZ 1)";
        26="(UTC+03:00) Baghdad";
        74="(UTC+03:00) Kuwait, Riyadh";
        109="(UTC+03:00) Minsk";
        51="(UTC+03:00) Moscow, St. Petersburg, Volgograd (RTZ 2)";
        56="(UTC+03:00) Nairobi";
        25="(UTC+03:30) Tehran";
        24="(UTC+04:00) Abu Dhabi, Muscat";
        54="(UTC+04:00) Baku";
        106="(UTC+04:00) Izhevsk, Samara (RTZ 3)";
        89="(UTC+04:00) Port Louis";
        82="(UTC+04:00) Tbilisi";
        84="(UTC+04:00) Yerevan";
        48="(UTC+04:30) Kabul";
        58="(UTC+05:00) Ekaterinburg (RTZ 4)";
        87="(UTC+05:00) Islamabad, Karachi";
        47="(UTC+05:00) Tashkent";
        23="(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi";
        66="(UTC+05:30) Sri Jayawardenepura";
        62="(UTC+05:45) Kathmandu";
        71="(UTC+06:00) Astana";
        102="(UTC+06:00) Dhaka";
        46="(UTC+06:00) Novosibirsk (RTZ 5)";
        61="(UTC+06:30) Yangon (Rangoon)";
        22="(UTC+07:00) Bangkok, Hanoi, Jakarta";
        64="(UTC+07:00) Krasnoyarsk (RTZ 6)";
        45="(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi";
        63="(UTC+08:00) Irkutsk (RTZ 7)";
        21="(UTC+08:00) Kuala Lumpur, Singapore";
        73="(UTC+08:00) Perth";
        75="(UTC+08:00) Taipei";
        94="(UTC+08:00) Ulaanbaatar";
        20="(UTC+09:00) Osaka, Sapporo, Tokyo";
        72="(UTC+09:00) Seoul";
        70="(UTC+09:00) Yakutsk (RTZ 8)";
        19="(UTC+09:30) Adelaide";
        44="(UTC+09:30) Darwin";
        18="(UTC+10:00) Brisbane";
        76="(UTC+10:00) Canberra, Melbourne, Sydney";
        43="(UTC+10:00) Guam, Port Moresby";
        42="(UTC+10:00) Hobart";
        99="(UTC+10:00) Magadan";
        68="(UTC+10:00) Vladivostok, Magadan (RTZ 9)";
        107="(UTC+11:00) Chokurdakh (RTZ 10)";
        41="(UTC+11:00) Solomon Is., New Caledonia";
        108="(UTC+12:00) Anadyr, Petropavlovsk-Kamchatsky (RTZ 11)";
        17="(UTC+12:00) Auckland, Wellington";
        97="(UTC+12:00) Coordinated Universal Time+12";
        40="(UTC+12:00) Fiji";
        92="(UTC+12:00) Petropavlovsk-Kamchatsky - Old";
        67="(UTC+13:00) Nuku'alofa";
        16="(UTC+13:00) Samoa";
        }
        $timezoneString = $timezoneIDs.Get_Item($ID)
        if($null -ne $timezoneString) {
            return $timezoneString
        } else {
            return $ID
        }
    }
```
