#!/bin/bash

if [ "$CF_PAGES_BRANCH" == "main" ]; then
  # Run the build command for Cloudflare Pages in production (main branch)
  hugo
else
  # Else run for Cloudflare Pages preview
  hugo --baseURL $CF_PAGES_URL
fi