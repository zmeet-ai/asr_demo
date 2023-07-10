# -*- coding: utf-8 -*-

import requests
import asyncio
import sys
import json
import logging
import time
import argparse
from progress.bar import Bar
from auth.client_auth_service import get_signature_flytek, generate_signature

# 下面的app_id 和api_key仅供测试使用，生产环境请向商务申请(手机：18605811078, 邮箱：jiaozhu@abcpen.com)
app_id = "test1"
app_secret = "2258ACC4-199B-4DCB-B6F3-C2485C63E85A"

async def asr_offline(url_wave, args, audio_encode="mpeg2", audio_sample="16000"):

    timestamp = str(int(time.time()))

    #signa = get_signature_flytek(timestamp, app_id, app_secret)
    signa = get_signature_flytek(timestamp, app_id, app_secret)
    query_post_apply = {
        "ts": timestamp,
        "appid": app_id,
        "signa": signa,
        "audio_url": url_wave,
        "audio_encode": audio_encode,
        "audio_sample_rate": audio_sample,
        "has_participle": "false"
    }

    url = "http://{}/v1/asr/long".format(args.url)
    print("\nThe requst para is {}".format(query_post_apply))
    response = requests.post(url, query_post_apply)
    print(response.text)

    response_json = json.loads(response.text)
    query_post_task = {
        "ts": timestamp,
        "appid": app_id,
        "signa": signa
    }
    query_post_task["task_id"] = response_json["data"]["task_id"]

    query_post_result = requests.get(url, query_post_task)
    response_json = json.loads(query_post_result.text)
    bar = Bar('Processing', max=100)
    flag = response_json["code"]
    while (flag != '0'):
        bar.next()
        await asyncio.sleep(3)
        query_post_result = requests.get(url, query_post_task)
        response_json = json.loads(query_post_result.text)

        flag = response_json["code"]
        if (flag == '-1'):
            """in progress"""
            bar.next()
            continue

        bflag = int(flag)
        if (bflag != 0 and bflag != 1):
            print("\r\nother error-code: {}, desc: {}".format(
                response_json["code"], response_json["desc"]))
            return {"url": url_wave, "asr": response_json["desc"]}
    else:
        response_json = json.loads(query_post_result.text)

        return {"url": url_wave, "asr": response_json}


async def main():
    try:
        parser = argparse.ArgumentParser(description="ASR Server offline audio file demo",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
        parser.add_argument('-u', '--url', type=str, metavar='URL',
                            help='server url', default='ai.abcpen.com')
        args = parser.parse_args()


        if (len(app_id) <= 0 or len(app_secret) <= 0):
            print("Please apply appid and appsecret, demo will exit now")
            sys.exit(1)
        results = await asyncio.gather(asr_offline("https://zos.abcpen.com/tts/zmeet/20221023/3058bca8-52cb-11ed-961e-00155dc6cbed.mp3", args, audio_sample="48000"),
                                       asr_offline("https://zos.abcpen.com/tts/zmeet/20221023/b6a2c7ac-52c8-11ed-961e-00155dc6cbed.mp3", args, audio_sample="48000")
                                       )

        print("\n\nWill output the final result in order!")
        for result in results:
            if result:
                print(
                    "Result for {} is ---------------------> {}".format(result["url"], result["asr"]))
            print("\n\n\n")

    except KeyboardInterrupt:
        pass
    await results

if __name__ == "__main__":
    try:
        print("长语音离线识别演示, 演示异步提交请求服务时，返回识别结果依然有序; 该demo返回异步数组请求的json key value pair！")
        asyncio.run(main())
    except Exception as e:
        logging.info(f"Got ctrl+c exception-2: {repr(e)}, exit process")
