# -*- encoding:utf-8 -*-
from socket import *
import json
import time
import threading
from websocket import create_connection
import websocket
from urllib.parse import quote
import logging
import os
import argparse

from client_auth_service import get_signature_yitu, get_signature_flytek

class Client():
    def __init__(self):
        global args
        base_url = "wss://ai.abcpen.com/v1/asr/ws"
        ts = str(int(time.time()))

        self.end_tag = '{"end" : true}'
        if (args.style == "yitu"):
            signa = get_signature_yitu(ts, app_id, api_key)
        else:
            signa = get_signature_flytek(ts, app_id, api_key)

        self.ws = create_connection(
            base_url + "?appid=" + app_id + "&ts=" + ts + "&signa=" + quote(signa)+"&style="+args.style)
        self.trecv = threading.Thread(target=self.recv)
        self.trecv.start()

    def send(self, file_path):
        file_object = open(os.path.join(
            os.path.dirname(__file__), file_path), 'rb')
        try:
            index = 1
            while True:
                chunk = file_object.read(6400)
                if not chunk:
                    break
                self.ws.send(chunk, 0x2)

                index += 1
                time.sleep(0.2)
        finally:
            file_object.close()

        self.ws.send(self.end_tag.encode('utf-8'))
        print("send end tag success")

    def recv(self):
        try:
            while self.ws.connected:
                result = str(self.ws.recv())
                if len(result) == 0:
                    print("receive result end")
                    continue

                result_dict = json.loads(result)
                if ("action" not in result_dict):
                    continue
                # 解析结果
                if result_dict["action"] == "started":
                    print(result)

                if result_dict["action"] == "result":
                    result_1 = result_dict
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


if __name__ == '__main__':
    global args

    parser = argparse.ArgumentParser(description="ASR Server test",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('-s', '--style', type=str, metavar='STYLE',
                        help='api style', default='flytek')
    parser.add_argument('-u', '--url', type=str, metavar='URL',
                        help='server url', default='localhost:3698')
    parser.add_argument('-l', '--log_path', type=str, metavar='LOG',
                        help='log file path', default='asr_res.log')
    parser.add_argument('-f', '--wave_path', type=str, metavar='WAVE',
                        help='wave file path', default='./test_1.wav')
    args = parser.parse_args()

    logging.basicConfig()

    app_id = ""
    api_key = ""
    file_path = r"./test_1.pcm"

    client = Client()
    client.send(file_path)
