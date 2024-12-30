## run.sh脚本使用说明
```bash
Usage: ./run.sh [command] [args]
Commands:
  clean           - 清理编译产出
  compile         - 编译项目
  package         - 打包项目
  test            - 运行测试
  run [mode] [args] - 运行程序，支持以下模式：
    asr <audio_file>     - 运行语音识别
    register <audio_file> <speaker_name> - 注册声纹
    search <audio_file>  - 搜索声纹
    delete-all          - 删除所有声纹
  all [mode] [args] - 清理、编译、打包并运行

Examples:
  ./run.sh run asr ../dataset/asr/3-1-60s.wav
  ./run.sh run register /path/to/audio.wav speaker_name
  ./run.sh run search /path/to/audio.wav
  ./run.sh run delete-all
  ./run.sh all asr ../dataset/asr/3-1-60s.wav
```

## 项目启动前先配置 .env
* 在项目根目录下更新 .env 文件

## 直接运行jar包
### 运行ASR识别
```bash
java -jar ./target/original-realtime_asr_voiceid-1.0-SNAPSHOT.jar asr ../dataset/asr/3-1-60s.wav
```

### 声纹
* 注册声纹
```bash
java -jar ./target/original-realtime_asr_voiceid-1.0-SNAPSHOT.jar register /path/to/audio.wav speaker_name
```
* 声纹
    * 声纹注册，选择在安静的环境下进行，否则会影响识别效果；录制16k采样率，16bit量化，单声道，wav格式，文件名格式为：speaker_name.wav
        * 录制的语音时长**不超过5分钟**。

* 搜索声纹
```bash
java -jar ./target/original-realtime_asr_voiceid-1.0-SNAPSHOT.jar search /path/to/audio.wav
```

* 删除所有声纹
```bash
java -jar ./target/original-realtime_asr_voiceid-1.0-SNAPSHOT.jar delete-all
```

# 运行run.sh
```bash
# 运行ASR识别
./run.sh run asr ../dataset/asr/3-1-60s.wav

# 注册声纹
./run.sh run register /path/to/audio.wav speaker_name

# 搜索声纹
./run.sh run search /path/to/audio.wav

# 删除所有声纹
./run.sh run delete-all

# 清理、编译、打包并运行（例如ASR模式）
./run.sh all asr ../dataset/asr/3-1-60s.wav
```
