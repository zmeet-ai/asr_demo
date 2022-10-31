#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from socket import *
import json
import time
import threading
from websocket import create_connection
import websocket
from urllib.parse import quote
import logging
import wave
import os
import sys
import argparse
import multiprocessing

from auth.client_auth_service import get_signature_flytek

time_per_chunk = 0.1

class Client():
    def __init__(self):
        global args
        base_url = "wss://{}/v1/asr/ws".format(args.url)
        ts = str(int(time.time()))

        signa = get_signature_flytek(ts, app_id, api_key)

        url_asr_apply = base_url + "?appid=" + app_id + "&ts=" + ts + "&signa=" + quote(signa)
        print("url_asr_apply is: ", url_asr_apply)
        self.ws = create_connection(url_asr_apply)
        self.trecv = threading.Thread(target=self.recv)
        self.trecv.start()

    def send(self, file_path):
        wf = wave.open(os.path.join(
            os.path.dirname(__file__), file_path), "rb")
        buffer_size = int(wf.getframerate() * 0.2)  # 0.2 seconds of audio
        sleep_time = time.time()
        while True:
            data = wf.readframes(buffer_size)

            if len(data) == 0:
                break

            self.ws.send(data, 0x2)
            if (time.time() - sleep_time) < time_per_chunk:
                time.sleep(time_per_chunk - (time.time() - sleep_time))
            sleep_time = time.time()

        self.ws.send("")
        print("send end tag success")

    def recv(self):
        try:
            while self.ws.connected:
                result = str(self.ws.recv())
                #print(result)
                if len(result) == 0:
                    print("receive result empty")
                    self.close()
                    break

                result_dict = json.loads(result)
                #print(result_dict)
                if ("action" not in result_dict):
                    continue
                # 解析结果
                if result_dict["action"] == "started":
                    print(result_dict)

                if result_dict["action"] == "result":
                    result_1 = result_dict
                    # result_2 = json.loads(result_1["cn"])
                    # result_3 = json.loads(result_2["st"])
                    # result_4 = json.loads(result_3["rt"])
                    print(result_1["data"])

                if result_dict["action"] == "error":
                    print("rtasr error: " + result)
                    self.ws.close()
                    return
                
                
        except websocket.WebSocketConnectionClosedException:
            print("receive result end")

    def close(self):
        self.ws.close()
        print("connection closed")

def zmq_daemon():
    global args
    client = Client()
    client.send(args.wave_path)

if __name__ == '__main__':

    global args

    parser = argparse.ArgumentParser(description="ASR Server test",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('-u', '--url', type=str, metavar='URL',
                        help='server url', default='ai.abcpen.com')
    parser.add_argument('-l', '--log_path', type=str, metavar='LOG',
                        help='log file path', default='asr_res.log')
    parser.add_argument('-f', '--wave_path', type=str, metavar='WAVE',
                        help='wave file path', default='./dataset/gametest.wav')
    args = parser.parse_args()
    logging.basicConfig()

    print("实时语音识别，使用wave包读取语音文件流")

    ## 下面的app_id 和api_key仅供测试使用，生产环境请向商务申请(手机：18605811078, 邮箱：jiaozhu@abcpen.com)
    app_id = "test1"
    api_key = "2258ACC4-199B-4DCB-B6F3-C2485C63E85A"
    if (len(app_id)<=0 or len(api_key)<=0):
        print("Please apply appid and appsecret, demo will exit now")
        sys.exit(1)

    #for i in range(5):
        #client = Client()
        #client.send(args.wave_path)
    mp = multiprocessing.Process(target=zmq_daemon)
    #mp.daemon = True
    mp.start()