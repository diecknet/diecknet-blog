---
comments: true
title: "Von 11ty zu Hugo migrieren"
date: 2024-02-22
tags:
    [
        static site generator,
        ssg,
        website,
        hugo,
        eleventy,
        11ty
    ]
---

Ich habe diese Website kürzlich auf 11ty v2.0 aktualisiert, aber ich habe noch mehr Veränderung gewollt. Anfangs habe ich nur ein simples Design mit [Terminal.css](https://github.com/Gioni06/terminal.css) bauen wollen. Dann bin ich aber zufällig über die [Hugo Theme Gallery](https://themes.gohugo.io/) gestolpert und habe ein paar richtig schöne Themes gefunden! Deshalb habe ich mich entschieden, [Hugo Papermod](https://github.com/adityatelange/hugo-PaperMod/) zu nutzen und die Website auf Hugo zu migrieren 🤓. Da ich JavaScript nicht *wirklich* beherrsche, ist es für mich egal, dass Hugo stattdessen Go nutzt. Ich habe Go als Programmiersprache zwar noch nie verwendet, aber klingt gut.  
Ich habe jetzt einfach mal ein bisschen zusammengeschrieben, was ich für die Migration meines Blogs gemacht habe.

## Bilder von /assets/ nach /static/ verschieben

Mit 11ty habe ich `/assets/` zum Speichern meiner Bilder verwendet. Bei Hugo ist dieser Ordner für die Verarbeitung bestimmter Assets genutzt worden. Stattdessen gibt es den Ordner `/static/`. Ich habe einfach alles rübergeschoben und mit VSCode per „Search and Replace“ die alten Pfade ersetzt.

## Konfigurationsdatei-Format

Bei Hugo habt ihr freie Wahl zwischen YAML, TOML oder JSON für die Konfiguration. Ich habe für meine Haupt-Konfigurationsdatei anfangs JSON gewählt. Einfach weil:

- ich wegen der Einrückungen etwas Respekt vor YAML habe
- und TOML vorher nie genutzt habe.

*Ein paar Minuten später ...* Ich habe [TOML dann kurz nachgeschlagen und es hat echt sauber ausgesehen.](https://en.wikipedia.org/wiki/TOML) Deshalb habe ich meine Konfigurationsdatei zu TOML umgeschrieben.

## URLs

Okay. Ich habe meine bestehenden URLs behalten wollen, die ich in 11ty verwendet habe (und manche sogar schon aus Jekyll-Zeiten).
Offenbar lassen die Hugo Standard-Einstellungen den Sprachcode der Default-Sprache weg. Außerdem haben alle meine Posts in einer Verzeichnisstruktur wie `/content/<language-code>/posts/<year>/` gelegen, aber die tatsächlichen URLs sind wie `/<languagecode>/<year>/<month>/<day>/` gewesen. Also habe ich die Permalink-Option anpassen müssen.

Ich habe die folgenden Optionen zu meiner Hugo-Konfiguration hinzugefügt:

```json
"defaultContentLanguage": "de",
"defaultContentLanguageInSubdir": true,
"languages": {
    "de": {
        "contentDir": "content/de",
        "languageName": "Deutsch",
        "weight": 10
    },
    "en": {
        "contentDir": "content/en",
        "languageName": "English",
        "weight": 20
    }
},
"permalinks": {
    "posts": "/:year/:month/:day/:slug/"
},
```

### Frontmatter für Slug/Path anpassen

Problem: Die URLs der Posts sind immer noch falsch gewesen. Das hat daran gelegen, dass der komplette `slug`-Teil meiner .md-Dateien das Datum enthalten hat. Theoretisch hätte ich die Dateinamen ändern *können*, damit die URLs wieder korrekt sind. Ich habe mich aber dagegen entschieden, weil ich die einfache sortierte Struktur in den Content-Verzeichnissen mag.

Lösung: Ich habe PowerShell verwendet, um in jedem Frontmatter all meiner Posts einen `slug`-Eintrag hinzuzufügen. Das ist Quick and Dirty **plus** gewesen. Kein echtes Error-Handling oder so, aber ich habe ein paar Kommentare ergänzt.

```powershell
$mds=Get-ChildItem de,en -Filter *.md -Recurse # get all *.md files from the subfolders "de" and "en" of the current dir
foreach($md in $mds) { # loop through all .md files
    $content = Get-Content -Path $md.FullName -Raw -Encoding utf8 # retrieve the content of the current file as one string (no array)

    # try to regex match the filename of the current file. 
    # Using a named capture group here called "slug".
    if(($md.Name -match '^\d{4}-\d{2}-\d{2}-(?<slug>.*)\.md$') -eq $false) { 
        Write-Host "Error at $($md.FullName)" -ForegroundColor "red"
    } else {
        # if successfully regex matched: do another regex, but this time replace the first occurence of "---" with "---" and append the slug field.
        Set-Content -Path $md.FullName -Value ([regex]'---').Replace($content,"---`r`nslug: $($Matches.slug)",1) -Encoding utf8 -NoNewLine
    }
}
```

Anfangs habe ich vergessen, `-NoNewLine` zu setzen, daher habe ich danach aufräumen müssen ...

```ps1
$mds=Get-ChildItem de,en -Filter *.md -Recurse # get all *.md files from the subfolders "de" and "en" of the current dir
foreach($md in $mds) { # loop through all .md files
    $content = Get-Content -Path $md.FullName -Raw -Encoding utf8 # retrieve the content of the current file as one string (no array)
    # trim all trailing blank lines, but this time we omit -noNewLine, so we have a single newline at the end
    Set-Content -path ($md.FullName) -Value $content.trim() -Encoding utf8   
}

```

### Groß-/Kleinschreibung

Hugo hat alle Slugs in Kleinschreibung umgewandelt. Meine URLs haben größtenteils Großbuchstaben enthalten, aber ich habe da nie wirklich drauf geachtet. Meiner Meinung nach haben komplett kleingeschriebene URLs ganz gut ausgesehen. Ich habe aber nicht alle bisherigen URLs ändern und zusätzlich Weiterleitungsregeln bauen wollen.

Ich habe das zur Hugo-Konfiguration hinzugefügt, um Groß- und Kleinschreibung so zu behalten, wie sie gewesen ist.

```json
"disablePathToLower": true
```

Ich denke aber, dass ich ab jetzt nur noch Slugs in Kleinschreibung verwende. Ich habe für alle alten Posts tatsächlich Lower-Case-Slugs (bzw. eher Slug-Aliases) mit einem sehr ähnlichen PowerShell-Snippet ergänzt. Dafür habe ich nur die `Set-Content`-Zeile so geändert:

```ps1
# add alias to post
Set-Content -Path $md.FullName -Value ([regex]'---').Replace($content,"---`r`naliases:`r`n    - $($Matches.slug.toLower())",1) -Encoding utf8 -NoNewline

```

## Mehrsprachigkeit - mein Weg

Eine mehrsprachige Website zu betreiben ist nicht so einfach. Und bei jeder Migration, die ich mit diesem Blog gemacht habe, hat sich etwas daran geändert, wie die jeweilige Blogsoftware das handhabt. Ich habe die Inhalte leicht zugänglich machen wollen, deshalb habe ich – je nach Thema – Content auf Deutsch, Englisch oder in beiden Sprachen bereitgestellt.  
Meine Idee ist also gewesen:

- ✅ Ich möchte die englischen Posts den deutschsprachigen Besucher:innen anzeigen, wenn es keine deutsche Version des Posts gibt.
- ❌ Ich möchte die deutschen Posts den englischsprachigen Besucher:innen **nicht anzeigen**, wenn es keine englische Version des Posts gibt.

Ich gehe davon aus, dass mehr deutschsprachige Leute Englisch verstehen als umgekehrt.
Leider hat es dafür in Hugo keine Funktion gegeben. Ich habe aber ein paar funky Filter gebaut, die mein Ziel erreicht haben. Das habe ich in meine Datei [layouts/_default/list.html](https://github.com/diecknet/diecknet-blog/blob/265016c97e1861bd9e713345eba6affbc93567d4/layouts/_default/list.html#L42-L49) gepackt:

```go {linenostart=42}
{{- if eq .Site.Language.Lang "de" }}
{{- $pages = where (where site.AllPages "Kind" "page") "Type" "in" site.Params.mainSections }}
{{- $pages = where (where $pages ".Language.Lang" "!=" .Site.Language.Lang) ".IsTranslated" "!=" true }}
{{- $pages = append (where site.RegularPages "Type" "in" site.Params.mainSections) $pages }}
{{- $pages = sort $pages ".Date" "desc"}}
{{- else }}
{{- $pages = where site.RegularPages "Type" "in" site.Params.mainSections }}
{{- end }}
```

### Aktuelle Sprache hervorheben

Der einzige Nachteil bei diesem Ansatz ist gewesen, dass Nutzer:innen die Sprache der Seite wechseln, wenn sie auf einen Post in einer anderen Sprache geklickt haben. Ich habe versucht, das etwas auszugleichen, indem ich die aktuelle Sprache im Seiten-Header mit **fetter Schrift** hervorgehoben habe (Datei: layouts/partials/header.html).

```go {linenostart=112}
{{- if eq .Language.LanguageName site.Language.LanguageName }}
    <b>{{- .Language.LanguageName -}}</b>
{{- else }}
    {{- .Language.LanguageName -}}
{{- end -}}     
```

### Posts aus anderen Sprachen in Hugo anzeigen

Anfangs habe ich diese andere Variante in Betracht gezogen, die immer Einträge aus anderen Sprachen eingebunden hat, wenn es in der aktuellen Sprache keine Version gegeben hat. Ich habe sie hier gelassen, falls jemand sie übernehmen will.

```go {linenostart=42}
{{- $pages = where (where site.AllPages "Kind" "page") "Type" "in" site.Params.mainSections }}
{{- $pages = where $pages "Params.hiddenInHomeList" "!=" "true"  }}
{{- $pages = where (where $pages ".Language.Lang" "!=" .Site.Language.Lang) ".IsTranslated" "!=" true }}
{{- $pages = append (where site.RegularPages "Type" "in" site.Params.mainSections) $pages }}
{{- $pages = sort $pages ".Date" "desc"}}
```

## Giscus für Kommentare

Da ich schon dabei war, habe ich [giscus](https://github.com/giscus/giscus) für Kommentare aktiviert. Ich habe [meine eigene giscus-Instanz](https://github.com/diecknet/giscus) auf Vercel gehostet.

Ich habe einen `comments: true`-Eintrag zum Frontmatter aller bestehenden Blogposts hinzugefügt:

```ps1
$mds=Get-ChildItem de,en -Filter *.md -Recurse # get all *.md files from the subfolders "de" and "en" of the current dir
foreach($md in $mds) { # loop through all .md files
    $content = Get-Content -Path $md.FullName -Raw -Encoding utf8 # retrieve the content of the current file as one string 
    # replace the first occurence of "---" with "---" and append the comment field.
    Set-Content -Path $md.FullName -Value ([regex]'---').Replace($content,"---`r`ncomments: true",1) -Encoding utf8 -NoNewLine   
}
```

Diesmal habe ich von Anfang an daran gedacht, `-NoNewLine` mitzugeben 😛. 

### Update 2026

Mittlerweile verwende ich Giscus nicht mehr. War zwar ganz nett, aber ich hatte keine Lust die Software aktuell zu halten.

## Fazit

Okay, wow – dieser Post hat über ein Jahr in meinen Entwürfen gelegen. Ich bin nicht sicher, ob ich zwischenzeitlich etwas vergessen habe, aber ich denke, dass das Wichtigste drin gewesen ist. Auf jeden Fall läuft Hugo jetzt, ohne größere Probleme. Kann ich empfehlen, ich habe nicht mehr zu 11ty zurückgeschaut.  
Der nächste Plan für die Seite ist eine Migration von Cloudflare Pages zu Netcup – ich bin kein großer Fan davon, wie viel vom Internet durch Cloudflare (und andere große Anbieter) kontrolliert worden ist.

### Update 2026

Mittlerweile wird die Webseite bei Netcup gehosted.
