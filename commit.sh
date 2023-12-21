#!/bin/bash
read -p "commit message: " msg
git add .
git commit -m "$msg"
git push
