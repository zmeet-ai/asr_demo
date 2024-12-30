# ASR 离线转写 API 文档

## 基础信息

- 基础URL: [`https://audio.abcpen.com:8443`](https://audio.abcpen.com:8443)
- 所有请求需要包含以下认证头:
  ```
  X-App-Key: <application_key>
  X-App-Signature: <signature>
  X-Timestamp: <timestamp>
  ```

## 认证说明

签名生成规则:
1. 使用应用ID和时间戳拼接字符串，计算MD5值
2. 使用应用密钥对MD5值进行HMAC-SHA1加密
3. 将加密结果进行Base64编码

## API 端点

### 1. 提交转写任务

**请求路径:** `/asr-offline/submit_task/v1`

**请求方法:** POST

**请求参数:**
```json
{
    "audio_url": "音频文件URL",
    "app_id": "应用ID",
    "task_id": "任务ID",
    "language": "语言代码"
}
```

**参数说明:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| audio_url | string | 是 | 待转写音频的URL地址 |
| app_id | string | 是 | 应用ID |
| task_id | string | 是 | 任务唯一标识符 |
| language | string | 是 | 音频语言，如"en"表示英语 |

### 2. 查询任务状态

**请求路径:** `/asr-offline/check_status/v1/{task_id}`

**请求方法:** GET

**路径参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | string | 是 | 任务ID |

**返回状态:**
- completed: 转写完成
- processing: 处理中
- not_found: 任务不存在或已过期

### 3. 获取转写结果

**请求路径:** `/asr-offline/get_result/v1/{task_id}`

**请求方法:** GET

**路径参数:**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| task_id | string | 是 | 任务ID |

## 使用示例

```python
# 1. 提交转写任务
task_id = str(uuid.uuid4())
response = submit_task(
    audio_url="https://example.com/audio.wav",
    app_id="test_app",
    task_id=task_id,
    language="en"
)

# 2. 轮询检查任务状态
status = check_status(task_id)

# 3. 获取转写结果
result = get_result(task_id)
```

## 错误码说明

### 通用错误码
| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| -1 | 系统错误 | 请联系技术支持 |
| 1 | 任务处理中 | 继续轮询任务状态 |
| 400 | 请求参数错误 | 检查请求参数是否符合要求 |
| 401 | 认证失败 | 检查认证信息是否正确 |
| 500 | 服务器内部错误 | 请联系技术支持 |

### 任务状态说明
| 状态值 | 说明 |
|--------|------|
| queued | 任务已提交，等待处理 |
| processing | 任务处理中 |
| completed | 任务处理完成 |
| not_found | 任务不存在或已过期 |
| unknown | 未知状态 |

### API响应示例

1. 提交任务成功响应:
```json
{
    "status": "success",
    "message": "Task submitted successfully",
    "task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

2. 查询任务状态响应:
```json
{
    "status": "processing",
    "code": "1",
    "task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

3. 获取转写结果成功响应:
```json
{
    "code": "0",
    "msg": "success",
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "app_id": "test_app",
    "audio_url": "https://example.com/audio.wav",
    "asr": {
        "speechResult": {
            "detail": [...],
            "onebest": "转写文本内容",
            "duration": 180.5
        }
    }
}
```

### 调用频率限制
- 单个IP每秒最多提交5个任务
- 单个APP_ID每天最多提交100个任务
- 查询任务状态建议间隔不少于1秒

### 其他注意事项
1. 音频文件要求：
   - 支持格式：WAV, MP3, M4A, FLAC; 支持视频文件，但视频文件提交前请先转码成音频格式
   - 最大文件大小：500MB
   - 最长时长：4小时（或以上）

2. 任务结果保留时间：
   - 转写结果保留24小时
   - 超过保留时间需要重新提交任务

3. 建议的轮询策略：
   - 前5分钟：每3秒查询一次
   - 5-30分钟：每10秒查询一次
   - 30分钟后：每30秒查询一次
