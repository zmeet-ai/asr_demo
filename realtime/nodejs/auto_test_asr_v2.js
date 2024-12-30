const WebSocket = require('ws');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { program } = require('commander');

// 常量定义
const TIME_PER_CHUNK = 0.2;  // 每次发送的音频数据的时间长度，单位：s
const NUM_CHANNEL = 1;  // 声道数
const NUM_QUANTIFY = 16;  // 量化位数
const SAMPLE_RATE = 16000;  // 采样频率
const BYTES_PER_CHUNK = Math.floor(SAMPLE_RATE * NUM_QUANTIFY * TIME_PER_CHUNK * NUM_CHANNEL / 8);
const SLEEP_TIME_DURATION = 100; // 100ms, 转换为毫秒

// 生成签名
function generateSignature(appId, apiKey) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const md5 = crypto.createHash('md5');
    md5.update(appId + ts);
    const baseString = md5.digest();
    
    const hmac = crypto.createHmac('sha1', apiKey);
    hmac.update(baseString);
    const signa = hmac.digest('base64');
    
    return { signa, ts };
}

// 发送音频数据
async function sendAudioData(ws) {
    return new Promise((resolve, reject) => {
        const filename = path.join(__dirname, "../dataset/test.wav");
        const readStream = fs.createReadStream(filename, {
            highWaterMark: BYTES_PER_CHUNK
        });

        const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

        readStream.on('data', async chunk => {
            const startTime = Date.now();
            
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(chunk);
                const elapsed = Date.now() - startTime;
                if (elapsed < SLEEP_TIME_DURATION) {
                    await sleep(SLEEP_TIME_DURATION - elapsed);
                }
            }
        });

        readStream.on('end', () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send('');  // 发送空字符串表示结束
            }
            resolve();
        });

        readStream.on('error', reject);
    });
}

// 接收识别结果
function receiveRecognitionResult(ws, printMode) {
    ws.on('message', data => {
        if (!data) return;
        
        try {
            const asrJson = JSON.parse(data);
            const isFinal = asrJson.is_final || false;
            const segId = asrJson.seg_id || 0;
            const asr = asrJson.asr || "";
            const type = asrJson.type || "";

            if (printMode === "typewriter") {
                if (type === "asr") {
                    if (isFinal) {
                        process.stdout.write(`\r${segId}:${asr}\n`);
                    } else {
                        process.stdout.write(`\r${segId}:${asr}`);
                    }
                }
            } else {
                if (isFinal) {
                    console.warn(asrJson);
                } else {
                    console.log(asrJson);
                }
            }
        } catch (err) {
            console.error('Error parsing message:', err);
        }
    });
}

async function connectToServer(printMode, asrType, recall) {
    const appId = "test1";
    const appSecret = "2258ACC4-199B-4DCB-B6F3-C2485C63E85A";
    const baseUrl = "ws://192.168.2.141:2001/asr-realtime/v2/ws";
    
    const { signa, ts } = generateSignature(appId, appSecret);
    const url = `${baseUrl}?appid=${appId}&ts=${ts}&signa=${encodeURIComponent(signa)}&asr_type=${asrType}&trans_mode=0&target_lang=ru&pd=court&recall=${recall}`;

    const ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
        ws.on('open', async () => {
            console.log('Connected to server');
            receiveRecognitionResult(ws, printMode);
            
            try {
                await sendAudioData(ws);
            } catch (err) {
                console.error('Error sending audio:', err);
                ws.close();
            }
        });

        ws.on('error', err => {
            console.error('WebSocket error:', err);
            reject(err);
        });

        ws.on('close', () => {
            console.log('Connection closed');
            resolve();
        });
    });
}

// 命令行参数解析
program
    .option('--mode <type>', 'Output mode: typewriter or json', 'typewriter')
    .option('--asr_type <type>', 'ASR recognition mode: sentence or word', 'word')
    .option('--recall', 'Enable recall mode', true)
    .parse(process.argv);

const options = program.opts();

// 主程序执行
connectToServer(options.mode, options.asr_type, options.recall)
    .catch(err => {
        console.error('Program error:', err);
        process.exit(1);
    });