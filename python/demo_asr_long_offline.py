#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import asyncio
import sys
import json
import logging
import os
import time
import argparse
from progress.bar import Bar
from urllib.parse import urlencode

from client_auth_service import get_signature_flytek


async def main():
    global args

    parser = argparse.ArgumentParser(description="ASR Server offline audio file demo",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('-u', '--url', type=str, metavar='URL',
                        help='server url', default='ai.abcpen.com')
    parser.add_argument('-l', '--log_path', type=str, metavar='LOG',
                        help='log file path', default='asr_res.log')
    parser.add_argument('-f', '--wave_path', type=str, metavar='WAVE',
                        help='wave file path', default='./test_1.wav')
    args = parser.parse_args()
    
    ## 下面的app_id 和api_key仅供测试使用，生产环境请向商务申请(手机：18605811078, 邮箱：jiaozhu@abcpen.com)
    app_id = "yitu"
    api_key = "2258ACC4-199B-4DCB-B6F3-C2439C63E85A"
    if (len(app_id)<=0 or len(api_key)<=0):
        print("Please apply appid and appsecret, demo will exit now")
        sys.exit(1)
    timestamp = str(int(time.time()))

    signa = get_signature_flytek(timestamp, app_id, api_key)
    querys = {
        "ts": timestamp,
        "appid": "yitu",
        "signa": signa,
        "audio_url": "https://zos.abcpen.com/tts/zmeet/20221023/3058bca8-52cb-11ed-961e-00155dc6cbed.mp3",

    }
    querys2 = {
        "ts": timestamp,
        "appid": "yitu",
        "signa": signa
    }
    url = "https://{}/v1/asr/long".format(args.url)
    response = requests.post(url, querys)
    print(response.text)

    response_json = json.loads(response.text)
    querys2["task_id"] = response_json["data"]["task_id"]

    response2 = requests.get(url, querys2)
    response_json = json.loads(response2.text)
    bar = Bar('Processing', max=100)
    while (response_json["code"] != '0'):
        bar.next()
        await asyncio.sleep(1)
        response2 = requests.get(url, querys2)
        response_json = json.loads(response2.text)
    else:
        response_json = json.loads(response2.text)
        print("\n")
        print(response_json)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        logging.info("Got ctrl+c exception-2: %s, exit process", repr(e))
