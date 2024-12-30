#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
import uuid
import random
import os,sys
from pathlib import Path
from time import perf_counter
import json
import time
import hmac, hashlib, base64
from loguru import logger
from time import sleep
from typing import Dict, Any, Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

root_dir = os.path.dirname(__file__)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(__file__), "../dataset/voiceid"))

# for test env
# URL_SERVER = "http://192.168.2.141:3700"
# for production env
URL_SERVER = "https://voiceid.abcpen.com:8443"

def update_logger():
    log_file = os.getenv("LOG_FILE", "/data/logs/voiceid/voiceid.log")
    log_dir = os.path.dirname(log_file)
    # 检查目录是否存在，如果不存在则创建
    if not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)
    log_level = os.getenv("LOG_LEVEL", "INFO")
    max_file_size = 100 * 1024 * 1024  # 100 MB
    logger.remove()
    logger.add(
        sys.stderr,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message} | {function}->{line} ",
        level=log_level,
    )
    logger.add(
        log_file,
        rotation=max_file_size,  # 当文件大小达到100MB时进行切分
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message} | {function}->{line}",
        level=log_level,
    )

@dataclass
class VoiceIDConfig:
    """声纹配置类"""
    url_server: str = "https://voiceid.abcpen.com:8443"
    app_key: str = os.getenv("ZMEET_APP_ID")
    app_secret: str = os.getenv("ZMEET_APP_SECRET")
    
    def __post_init__(self):
        # 检查必需的环境变量
        if not self.app_key or not self.app_secret:
            raise ValueError("缺少必需的环境变量：ZMEET_APP_ID 或 ZMEET_APP_SECRET 未设置")
            
        logger.info(f"app_key: {self.app_key}, app_secret: {self.app_secret}")
        
        self.org_id: str = self.app_key
        self.tag_id: str = self.app_key
        self.audio_dirs = {
            "register": "../dataset/voiceid/register",  # 注册音频目录
            "verify": "../dataset/voiceid/verify",  # 验证音频目录
            "complex": "../dataset/voiceid/register",  # 添加复杂音频目录
        }

class VoiceIDClient:
    """声纹识别客户端"""
    def __init__(self, config: VoiceIDConfig):
        self.config = config
        self.headers = self._generate_headers()
        
    @staticmethod
    def generate_signature(app_id: str, api_key: str) -> str:
        """
        @param app_id: 应用程序ID
        @param api_key: 应用程序秘钥
        @return: 签名, 时间戳
        """
        ts: str = str(int(time.time()))
        tt = (app_id + ts).encode("utf-8")
        md5 = hashlib.md5()
        md5.update(tt)
        baseString = md5.hexdigest()
        baseString = bytes(baseString, encoding="utf-8")

        apiKey = api_key.encode("utf-8")
        signa = hmac.new(apiKey, baseString, hashlib.sha1).digest()
        signa = base64.b64encode(signa)
        signa = str(signa, "utf-8")
        return signa, ts

    def _generate_headers(self) -> Dict[str, str]:
        """生成请求头"""
        signature, timestamp = self.generate_signature(self.config.app_key, self.config.app_secret)
        return {
            "X-App-Key": self.config.app_key,
            "X-App-Signature": signature,
            "X-Timestamp": timestamp,
        }
    
    def register_voice(self, audio_path: str, speaker_id: str, audio_preprocess: bool = False) -> Dict[str, Any]:
        """注册单个声纹"""
        try:
            with open(audio_path, "rb") as f:
                files = {"audio": f}
                values = {
                    "spk_name": speaker_id,
                    "org_id": self.config.org_id,
                    "tag_id": self.config.tag_id,
                    "denoise_audio": "0",
                    "audio_preprocess": str(audio_preprocess).lower(),
                }
                url = f"{self.config.url_server}/voiceid/register"
                t1 = perf_counter()
                response = requests.post(url, headers=self.headers, files=files, data=values)
                logger.info(
                    f"Speaker id: {speaker_id} register result: {response.text}, time: {perf_counter() - t1}s"
                )
                return response.json()
        except Exception as e:
            logger.error(f"Register voice failed: {str(e)}")
            raise

    def register_directory(self, audio_preprocess: bool = False) -> None:
        """批量注册目录下的音频文件"""
        register_dir = self.config.audio_dirs["register"]
        for entry in os.scandir(register_dir):
            if entry.is_file() and entry.name.lower().endswith(('.wav', '.flac', '.m4a')):
                # 这里使用文件名去掉下划线之前的名字作为speaker name
                filename = os.path.splitext(entry.name)[0]
                speaker_id = filename.split("_")[0] if "_" in filename else filename
                self.register_voice(entry.path, speaker_id, audio_preprocess)

    def search_voice(self, audio_path: str, audio_preprocess: bool = False) -> Dict[str, Any]:
        """搜索单个声纹"""
        try:
            with open(audio_path, "rb") as f:
                files = {"audio": f}
                values = {
                    "org_id": self.config.org_id,
                    "tag_id": self.config.tag_id,
                    "denoise_audio": "0",
                    "audio_preprocess": str(audio_preprocess).lower(),
                }
                url = f"{self.config.url_server}/voiceid/recognize"
                t1 = perf_counter()
                response = requests.post(url, headers=self.headers, files=files, data=values)
                logger.info(
                    f"Search result: {response.text}, time: {perf_counter() - t1}s"
                )
                return response.json()
        except Exception as e:
            logger.error(f"Search voice failed: {str(e)}")
            raise

    def list_voices(self, limit: Optional[int] = None, offset: Optional[int] = None) -> Dict[str, Any]:
        """获取声纹列表"""
        url = f"{self.config.url_server}/voiceid/list"
        params = {
            "org_id": self.config.org_id,
            "tag_id": self.config.tag_id,
        }
        if limit is not None:
            params["limit"] = limit
        if offset is not None:
            params["offset"] = offset
            
        response = requests.get(url, headers=self.headers, params=params)
        logger.info(f"Voice list result: {response.text}")
        return response.json()

    def count_voices(self) -> Dict[str, Any]:
        """获取声纹数量"""
        url = f"{self.config.url_server}/voiceid/count"
        params = {
            "org_id": self.config.org_id,
            "tag_id": self.config.tag_id
        }
        response = requests.get(url, headers=self.headers, params=params)
        logger.info(f"Voice count result: {response.text}")
        return response.json()

    def get_voice_url(self, speaker_name: str) -> Dict[str, Any]:
        """获取指定说话人的语音URL"""
        url = f"{self.config.url_server}/voiceid/voice-url"
        params = {
            "spk_name": speaker_name,
            "org_id": self.config.org_id,
            "tag_id": self.config.tag_id
        }
        response = requests.get(url, headers=self.headers, params=params)
        logger.info(f"Voice URL result: {response.text}")
        return response.json()

    def delete_speaker(self, speaker_name: str) -> Dict[str, Any]:
        """删除指定说话人的声纹"""
        url = f"{self.config.url_server}/voiceid/del-spk-name"
        params = {
            "spk_name": speaker_name,
            "org_id": self.config.org_id,
            "tag_id": self.config.tag_id
        }
        response = requests.get(url, headers=self.headers, params=params)
        logger.info(f"Delete speaker result: {response.text}")
        return response.json()

    def delete_all_speakers(self) -> Dict[str, Any]:
        """删除所有声纹"""
        url = f"{self.config.url_server}/voiceid/delete-speakers"
        params = {
            "org_id": self.config.org_id,
            "tag_id": self.config.tag_id
        }
        response = requests.get(url, headers=self.headers, params=params)
        logger.info(f"Delete all speakers result: {response.text}")
        return response.json()

    def register_complex_directory(self) -> None:
        """注册复杂音频目录（支持多种格式）"""
        complex_dir = self.config.audio_dirs.get("complex", "")
        if not complex_dir:
            logger.warning("Complex audio directory not configured")
            return

        for elem in Path(complex_dir).rglob("*.*"):
            if elem.suffix.lower() in ['.flac', '.wav', '.mp3']:
                speaker_id = elem.stem.split("-")[0]
                self.register_voice(str(elem), speaker_id)

    def search_complex_directory(self, max_count: int = 100) -> None:
        """搜索复杂音频目录（支持多种格式）"""
        complex_dir = self.config.audio_dirs.get("complex", "")
        if not complex_dir:
            logger.warning("Complex audio directory not configured")
            return

        count = 0
        for elem in Path(complex_dir).rglob("*.*"):
            if elem.suffix.lower() in ['.flac', '.wav', '.mp3']:
                self.search_voice(str(elem))
                count += 1
                if count >= max_count:
                    break

    def search_directory(self) -> None:
        """验证目录下的所有音频文件"""
        verify_dir = self.config.audio_dirs["verify"]
        for entry in os.scandir(verify_dir):
            if entry.is_file() and entry.name.lower().endswith(('.wav', '.flac', '.m4a')):
                self.search_voice(entry.path)
                
def main():
    """主函数"""
    config = VoiceIDConfig()
    client = VoiceIDClient(config)
    
    try:
        # 执行所有操作
        client.register_directory()
        client.count_voices()
        client.list_voices()
        
        #client.search_voice(f"{config.audio_dirs['verify']}/1006_20241223_081645_full_audio.wav")
        # 验证目录下的所有音频文件
        client.search_directory()
        #client.delete_all_speakers()
    
    except Exception as err:
        logger.error(f"Error occurred: {repr(err)}")

if __name__ == "__main__":
    main()
