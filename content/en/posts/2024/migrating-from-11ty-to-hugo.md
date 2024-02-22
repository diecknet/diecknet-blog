---
comments: true
title: "Migrating from 11ty to Hugo"
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

I recently upgraded this website to 11ty v2.0, but I needed more change. Initially I just wanted to create a basic Design with [Terminal.css](https://github.com/Gioni06/terminal.css). But then I randomly stumbled over the [Hugo Theme Gallery](https://themes.gohugo.io/) and found some beautiful themes! So I chose to use [Hugo Papermod](https://github.com/adityatelange/hugo-PaperMod/) and migrate the Website to Hugo 🤓. Since I don't *really* know JavaScript, so it doesn't matter for me that Hugo uses Go instead. I never used Go as a programming language, but it sounds great.  
I'll just ramble a bit now what I did to migrate my blog.

## Moving images from /assets/ to /static/

With 11ty I used `/assets/` to store my images. With Hugo this folder is used to process certain assets. Instead there is a folder `/static/`. I just moved everything over and used "Search and Replace" with VSCode to replace the old paths.

## Config file format

With Hugo you're free to use either YAML, TOML or JSON for your configuration. I initially chose to use JSON for my main config file. Simply because:

- I'm a bit afraid of YAML because of the indentations
- and never used TOML before.

*A few moments later...* Actually [I just looked up TOML and it looks neat.](https://en.wikipedia.org/wiki/TOML) I rewrote my config file to TOML.

## URLs

Okay. I wanted to keep my existing URLs that I used in 11ty (and some of them even back with Jekyll).
Apparently the default settings omit the language code of the default language. Furthermore all my posts are in a directory structure like `/content/<language-code>/posts/<year>/`, but the actual URLs are like `/<languagecode>/<year>/<month>/<day>/`. So I had to customize the permalinks option.

I added the following options to my Hugo config:

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

### Adjusting Frontmatter for the Slug/Path

Problem: The URLs of the posts were still wrong. That's because the complete `slug`-part of my .md-files contains the date. Theoretically I *could* change the filenames, so that the URLs end up correct again. But I chose not to, because I like the simple sorted structure in the content directories.

Solution: I used PowerShell to add a `slug` entry to each Frontmatter of all my posts. This is Quick and Dirty **plus**. No real error handling or anything, but I added a few comments.

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

Initially I forgot to add `-NoNewLine` so I had to cleanup afterwards...

```ps1
$mds=Get-ChildItem de,en -Filter *.md -Recurse # get all *.md files from the subfolders "de" and "en" of the current dir
foreach($md in $mds) { # loop through all .md files
    $content = Get-Content -Path $md.FullName -Raw -Encoding utf8 # retrieve the content of the current file as one string (no array)
    # trim all trailing blank lines, but this time we omit -noNewLine, so we have a single newline at the end
    Set-Content -path ($md.FullName) -Value $content.trim() -Encoding utf8   
}

```

### Capitalization

Hugo converts all slugs to lower case. My URLs are mostly using Upper case, but I never really payed attention. IMO the all-lower-case urls look kinda good. But I don't want to change all previous URLs and add forwarding rules etc.

I added this to the Hugo config, to keep the upper and lower case as they are.

```json
"disablePathToLower": true
```

But I think I will use lower case slugs from now on. I actually added lower-case slugs (or rather slug-aliases) for all old posts using a very similar PowerShell snippet. But I changed the `Set-Content`-Line to:

```ps1
# add alias to post
Set-Content -Path $md.FullName -Value ([regex]'---').Replace($content,"---`r`naliases:`r`n    - $($Matches.slug.toLower())",1) -Encoding utf8 -NoNewline

```

## Multilanguage - My way

Running a multilanguage website is not that easy. And with every migration that I did with this blog, something changed with how the applications handled it. I want the content to be easily accessible, so - depending on the topic - I provide the content in German, English or both.  
So my idea is:

- ✅ I still want to show the English posts to the German speaking visitors, if there is no German version of that post available.
- ❌ I don't want to show German posts to English speaking visitors, if there is no English version of that post available.

I assume that more German speaking folks understand English than vice-versa.
Sadly there is no function for that in Hugo. But I managed to create some funky filters that achieve my goal. I put this into my [layouts/_default/list.html](https://github.com/diecknet/diecknet-blog/blob/265016c97e1861bd9e713345eba6affbc93567d4/layouts/_default/list.html#L42-L49) file:

```go {linenostart=42}
{{- if eq .Site.Language.Lang "==" "de" }}
{{- $pages = where (where site.AllPages "Kind" "page") "Type" "in" site.Params.mainSections }}
{{- $pages = where (where $pages ".Language.Lang" "!=" .Site.Language.Lang) ".IsTranslated" "!=" true }}
{{- $pages = append (where site.RegularPages "Type" "in" site.Params.mainSections) $pages }}
{{- $pages = sort $pages ".Date" "desc"}}
{{- else }}
{{- $pages = where site.RegularPages "Type" "in" site.Params.mainSections }}
{{- end }}
```

### Highlight current language

The only downside with this approach is, that users will change the language of the site, if they click on a post in another language. I tried to compensate that a bit, by highlighting the current language with **bold text** in the site header (file: layouts/partials/header.html).

```go {linenostart=112}
{{- if eq .Language.LanguageName site.Language.LanguageName }}
    <b>{{- .Language.LanguageName -}}</b>
{{- else }}
    {{- .Language.LanguageName -}}
{{- end -}}     
```

### Show posts from other languages in Hugo

Initially I considered this other variant, which always includes entries from other languages if there is no version in the current language. I'll keep it here, in case anyone wants to yoink it.

```go {linenostart=42}
{{- $pages = where (where site.AllPages "Kind" "page") "Type" "in" site.Params.mainSections }}
{{- $pages = where $pages "Params.hiddenInHomeList" "!=" "true"  }}
{{- $pages = where (where $pages ".Language.Lang" "!=" .Site.Language.Lang) ".IsTranslated" "!=" true }}
{{- $pages = append (where site.RegularPages "Type" "in" site.Params.mainSections) $pages }}
{{- $pages = sort $pages ".Date" "desc"}}
```

## Giscus for comments

While I was on it, I enabled [giscus](https://github.com/giscus/giscus) for comments. I host [my own instance of giscus](https://github.com/diecknet/giscus) on Vercel.

Added a `comments: true` entry to the frontmatter of all existing blog posts:

```ps1
$mds=Get-ChildItem de,en -Filter *.md -Recurse # get all *.md files from the subfolders "de" and "en" of the current dir
foreach($md in $mds) { # loop through all .md files
    $content = Get-Content -Path $md.FullName -Raw -Encoding utf8 # retrieve the content of the current file as one string 
    # replace the first occurence of "---" with "---" and append the comment field.
    Set-Content -Path $md.FullName -Value ([regex]'---').Replace($content,"---`r`ncomments: true",1) -Encoding utf8 -NoNewLine   
}
```

This time I remembered to include `-NoNewLine` from the start 😛. 

## Conclusion

Okay, wow so this post was in my drafts for over a year. I'm not sure if I forgot to add anything in the meantime - but I think the most important stuff is in here. Anyway - so Hugo is running, no major issues. Can recommend, I'm not looking back to 11ty.  
Next plan for the site is to migrate from Cloudflare Pages to Netcup -  I'm not a huge fan of how much of the Internet is controlled by Cloudflare (and other big providers).
