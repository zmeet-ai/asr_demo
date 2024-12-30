# 语音识别测试工具

## 使用方法
* 安装依赖库：npm install
* 运行脚本：node auto_test_asr.js
* 具体参数帮助指引：node auto_test_asr.js --help    

## 项目启动前先配置 .env
* 在项目根目录下更新 .env 文件

### 可选参数
- `--mode <type>`: 输出模式，可选 'typewriter' 或 'json'，默认为 'typewriter'
- `--asr_type <type>`: 识别模式，可选 'sentence' 或 'word'，默认为 'word'
- `--voiceprint <boolean>`: 是否启用声纹识别，默认为 true
- `--voiceprint_org_id <string>`: 声纹识别的组织 ID，默认使用环境变量 ZMEET_APP_ID
- `--voiceprint_tag_id <string>`: 声纹识别的标签 ID，默认使用环境变量 ZMEET_APP_ID
- `--audio_file <path>`: 音频文件路径，默认为 '../dataset/asr/test.wav'

### 示例

* 基本用法：

```bash
Usage: auto_test_asr [options]

Options:
  --mode <type>                 Output mode: typewriter or json (default: "typewriter")
  --asr_type <type>             ASR recognition mode: sentence or word (default: "word")
  --voiceprint <boolean>        Enable voiceprint recognition (default: true)
  --voiceprint_org_id <string>  Organization ID for voiceprint (default: "lianxintest1")
  --voiceprint_tag_id <string>  Tag ID for voiceprint (default: "lianxintest1")
  --audio_file <path>           音频文件路径 (default: "/root/gitlab/asr-daemon/docs/sdk/dataset/asr/test.wav")
  -h, --help                    display help for command
```
* 基本用法

```bash
node auto_test_asr.js
```

* 指定音频文件：

```bash
node auto_test_asr.js --audio_file ../dataset/asr/test.wav
```
* 组合使用

```bash
node auto_test_asr.js --mode json  --audio_file ../dataset/asr/test.wav
```
