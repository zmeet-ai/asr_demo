## 安装使用说明
* SDK仅支持Python3，暂不支持Python2。
* 安装依赖库：pip install -r requirements.txt
* 可使用conda环境，安装命令：conda create -n asr python=3.10

## 项目启动前先配置 .env
* 在项目根目录下更新 .env 文件

## 实时语音识别
* 运行脚本：python auto_test_asr_v2.py
* 实时识别的时候，已经使用了声纹脚本（auto_test_speaker_id.py）进行注册，所以不需要再进行注册; 其中的默认语音文件已经有注册的声纹。
  * 要查看实时返回的声纹，使用 "--mode json" 参数,  会实时看到type为voiceprint的json返回，其中有实时返回的speaker。
  ```bash
  ./auto_test_asr_v2.py --mode json
  ```
* 具体参数帮助指引：python auto_test_asr_v2.py --help       
```bash
usage: auto_test_asr_v2.py [-h] [--mode {typewriter,json}] [--asr_type {sentence,word}] [--audio_file AUDIO_FILE]

ASR Client

options:
  -h, --help            show this help message and exit
  --mode {typewriter,json}
                        Output mode: typewriter (default) or json
  --asr_type {sentence,word}
                        ASR recognition mode: sentence (default) or word
  --audio_file AUDIO_FILE
                        Path to the audio file (default: ../dataset/asr/3-1-60s.wav)
```

## 声纹识别
* 运行脚本：python auto_test_speaker_id.py 
* 声纹
    * 声纹注册，选择在安静的环境下进行，否则会影响识别效果；录制16k采样率，16bit量化，单声道，wav格式，文件名格式为：speaker_name.wav
        * 录制的语音时长不超过5分钟。
* 声纹识别中，如实例所示，使用了dataset/voiceid/register目录下的音频文件进行注册，使用dataset/voiceid/verify目录下的音频文件进行验证。
* org_id和tag_id，如果未指定，则使用app_id作为默认值; org_id + tag_id + speaker_name 作为声纹的唯一标识, 如果注册提示重复事项，则需要先删除之前重复存在的speaker_name所代表的声纹，再进行注册。
