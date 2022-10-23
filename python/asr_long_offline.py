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

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))
from sdk.client_auth_service import get_signature_yitu, get_signature_flytek


async def main():
    global args

    parser = argparse.ArgumentParser(description="ASR Server test",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('-s', '--style', type=str, metavar='STYLE',
                        help='api style', default='yitu')
    parser.add_argument('-u', '--url', type=str, metavar='URL',
                        help='server url', default='localhost:3698')
    parser.add_argument('-l', '--log_path', type=str, metavar='LOG',
                        help='log file path', default='asr_res.log')
    parser.add_argument('-f', '--wave_path', type=str, metavar='WAVE',
                        help='wave file path', default='./test_1.wav')
    args = parser.parse_args()

    app_id = ""
    app_secret = ""
    timestamp = str(int(time.time()))
    if (args.style == "yitu"):
        signa = get_signature_yitu(timestamp, app_id, app_secret)
    else:
        signa = get_signature_flytek(timestamp, app_id, app_secret)
    querys = {
        "ts": timestamp,
        "appid": "yitu",
        "signa": signa,
        "style": args.style,
        "audio_url": "http://125.77.202.194:53398/tts/202207/23/18/zmeet_80883228.wav",

    }
    querys2 = {
        "ts": timestamp,
        "appid": "yitu",
        "signa": signa,
        "style": args.style
    }
    url = "https://ai.abcpen.com/v1/asr/long"
    response = requests.post(url, querys)
    print(response.text)

    response_json = json.loads(response.text)
    querys2["task_id"] = response_json["data"]["taskId"]

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
