#!/bin/bash
token="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"
curl -H "Authorization: token $token" https://api.github.com/search/repositories?q=user:webdev410\&per_page=100 >data/repos.json
# get second page
curl -H "Authorization: token $token" https://api.github.com/search/repositories?q=user:webdev410\&per_page=100\&page=2 >data/repos2.json
curl -H "Authorization: token $token" https://api.github.com/search/repositories?q=user:webdev410\&per_page=100\&page=3 >data/repos3.json
curl -H "Authorization: token $token" https://api.github.com/search/repositories?q=user:webdev410\&per_page=100\&page=4 >data/repos4.json
npm start
