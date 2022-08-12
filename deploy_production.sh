#!/bin/bash
rsync -avzP ./doc/site/* root@a.abcpen.com:/data/prj/www/api/  --exclude="node_modules" -e 'ssh -i ~/.ssh/jiaozhu'
